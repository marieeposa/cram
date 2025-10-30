from django.core.management.base import BaseCommand
from resilience.models import Municipality
import os

class Command(BaseCommand):
    help = 'Load municipality boundaries from shapefile'

    def add_arguments(self, parser):
        parser.add_argument('shapefile_path', type=str, help='Path to shapefile')
        parser.add_argument('--province', type=str, default='Negros Oriental', help='Province name')
        parser.add_argument('--region', type=str, default='Central Visayas', help='Region name')
        parser.add_argument('--srs', type=int, default=4326, help='Source coordinate system')

    def handle(self, *args, **options):
        shapefile = options['shapefile_path']
        province = options['province']
        region = options['region']
        source_srs = options['srs']
        
        if not os.path.exists(shapefile):
            self.stdout.write(self.style.ERROR(f'File not found: {shapefile}'))
            return
        
        self.stdout.write(f'Loading shapefile: {shapefile}')
        self.stdout.write(f'Province: {province}, Region: {region}')
        
        from django.contrib.gis.gdal import DataSource
        from django.contrib.gis.geos import GEOSGeometry, MultiPolygon
        
        ds = DataSource(shapefile)
        layer = ds[0]
        
        self.stdout.write(f'\nLayer: {layer.name}')
        self.stdout.write(f'Features: {len(layer)}')
        self.stdout.write(f'Fields: {layer.fields}')
        
        # Show sample
        if len(layer) > 0:
            first = layer[0]
            self.stdout.write('\nSample data:')
            for field in layer.fields[:10]:
                self.stdout.write(f'  {field}: {first.get(field)}')
        
        self.stdout.write('\n' + '='*80)
        self.stdout.write(self.style.WARNING('Please check field names above!'))
        self.stdout.write('You may need to adjust the field mapping in the code.')
        self.stdout.write('='*80)
        
        proceed = input('\nProceed? (yes/no): ')
        
        if proceed.lower() != 'yes':
            self.stdout.write(self.style.WARNING('Cancelled.'))
            return
        
        self.stdout.write('\nLoading municipalities...')
        
        loaded = 0
        skipped = 0
        errors = []
        
        for feature in layer:
            try:
                # Try different field names for municipality name
                name = None
                for field in ['NAME_3', 'NAME', 'MUN__NAME', 'CITY_NAME', 'MUNICIPAL', 'MUNICIP', 'LGU_NAME']:
                    if field in layer.fields:
                        name = feature.get(field)
                        if name:
                            break
                
                if not name:
                    skipped += 1
                    continue
                
                name = str(name).strip()
                
                # Get PSGC code if available
                psgc_code = None
                for field in ['PSGC_CODE', 'CODE', 'MUNICODE', 'MUN_CODE', 'PSGC']:
                    if field in layer.fields:
                        psgc_code = feature.get(field)
                        if psgc_code:
                            break
                
                # Get geometry
                geom = feature.geom
                if not geom or geom.geos is None:
                    self.stdout.write(self.style.WARNING(f'Skipped (no geometry): {name}'))
                    skipped += 1
                    continue
                
                geos_geom = geom.geos
                
                # Ensure MultiPolygon
                if geos_geom.geom_type == 'Polygon':
                    geos_geom = MultiPolygon(geos_geom)
                
                # Determine classification
                classification = 'City' if 'city' in name.lower() else 'Municipality'
                
                # Create or update
                municipality, created = Municipality.objects.update_or_create(
                    name=name,
                    province=province,
                    defaults={
                        'psgc_code': str(psgc_code) if psgc_code else None,
                        'region': region,
                        'classification': classification,
                        'geometry': geos_geom
                    }
                )
                
                loaded += 1
                self.stdout.write(f'{"✓ Created" if created else "✓ Updated"}: {name}')
                
            except Exception as e:
                error_msg = f'{name if "name" in locals() else "Unknown"}: {str(e)}'
                errors.append(error_msg)
                skipped += 1
                self.stdout.write(self.style.WARNING(f'Skipped: {error_msg}'))
        
        # Summary
        self.stdout.write('\n' + '='*80)
        self.stdout.write(self.style.SUCCESS(f'✓ Loaded {loaded} municipalities'))
        if skipped > 0:
            self.stdout.write(self.style.WARNING(f'⚠ Skipped {skipped} features'))
        
        # List loaded municipalities
        municipalities = Municipality.objects.filter(province=province).order_by('name')
        self.stdout.write(f'\nMunicipalities in {province}:')
        for mun in municipalities:
            self.stdout.write(f'  - {mun.name} ({mun.classification})')
        
        if errors and len(errors) <= 10:
            self.stdout.write('\nErrors:')
            for err in errors:
                self.stdout.write(f'  - {err}')
