from django.core.management.base import BaseCommand
from resilience.models import Barangay
from django.contrib.gis.gdal import DataSource
from django.contrib.gis.geos import MultiPolygon

class Command(BaseCommand):
    help = 'Update barangay geometries with official NAMRIA boundaries'

    def add_arguments(self, parser):
        parser.add_argument('shapefile_path', type=str, help='Path to official shapefile')

    def handle(self, *args, **options):
        shapefile = options['shapefile_path']
        
        ds = DataSource(shapefile)
        layer = ds[0]
        
        self.stdout.write(f'Loading official boundaries: {shapefile}')
        self.stdout.write(f'Features in shapefile: {len(layer)}')
        self.stdout.write(f'Current barangays in DB: {Barangay.objects.count()}')
        
        proceed = input('\nProceed with geometry update? (yes/no): ')
        if proceed.lower() != 'yes':
            return
        
        updated = 0
        not_found = 0
        new_barangays = []
        
        self.stdout.write('\nUpdating geometries...')
        
        for idx, feature in enumerate(layer):
            try:
                # Get identifiers
                adm4_pcode = feature.get('ADM4_PCODE')
                brgy_name = feature.get('ADM4_EN')
                mun_name = feature.get('ADM3_EN')
                
                # Get geometry and ensure it's MultiPolygon
                geom = feature.geom.geos
                
                # Convert Polygon to MultiPolygon
                if geom.geom_type == 'Polygon':
                    geom = MultiPolygon(geom)
                
                # Set SRID
                geom.srid = 4326
                
                # Try to find existing barangay by PSGC code
                barangay = None
                
                if adm4_pcode:
                    # Try direct PSGC match
                    barangay = Barangay.objects.filter(psgc_code=adm4_pcode).first()
                    
                    if not barangay:
                        # Try fuzzy match by name and municipality
                        barangay = Barangay.objects.filter(
                            name__iexact=brgy_name,
                            municipality__icontains=mun_name
                        ).first()
                
                if barangay:
                    # Update ONLY the geometry
                    barangay.geometry = geom
                    
                    # Also update PSGC if it was missing
                    if not barangay.psgc_code and adm4_pcode:
                        barangay.psgc_code = adm4_pcode
                    
                    barangay.save(update_fields=['geometry', 'psgc_code'])
                    updated += 1
                else:
                    # Track new barangays not in DB
                    not_found += 1
                    new_barangays.append(f"{brgy_name}, {mun_name} ({adm4_pcode})")
                
                if (idx + 1) % 50 == 0:
                    self.stdout.write(f'Processed {idx + 1}/{len(layer)}...')
            
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Error: {brgy_name} - {str(e)}'))
        
        # Summary
        self.stdout.write('\n' + '='*80)
        self.stdout.write(self.style.SUCCESS(f'✓ Updated geometries for {updated} barangays'))
        
        if not_found > 0:
            self.stdout.write(self.style.WARNING(f'⚠ {not_found} barangays in shapefile not found in DB'))
            
            if not_found <= 20:
                self.stdout.write('\nBarangays not in your DB:')
                for brgy in new_barangays[:20]:
                    self.stdout.write(f'  - {brgy}')
        
        # Verify sample
        sample = Barangay.objects.first()
        if sample:
            c = sample.geometry.centroid
            self.stdout.write(f'\n✓ Sample verification: {sample.name} at ({c.x:.4f}, {c.y:.4f})')
            
            if 122 < c.x < 124 and 9 < c.y < 11:
                self.stdout.write(self.style.SUCCESS('  ✓ Coordinates look correct!'))