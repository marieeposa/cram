from django.core.management.base import BaseCommand
from resilience.models import Barangay, LiquefactionHazard
import os

class Command(BaseCommand):
    help = 'Load liquefaction susceptibility shapefile'

    def add_arguments(self, parser):
        parser.add_argument('shapefile', type=str, help='Path to liquefaction shapefile')

    def handle(self, *args, **options):
        shapefile = options['shapefile']
        
        if not os.path.exists(shapefile):
            self.stdout.write(self.style.ERROR(f'File not found: {shapefile}'))
            return
        
        self.stdout.write(f'Loading: {shapefile}')
        
        from django.contrib.gis.gdal import DataSource
        
        try:
            ds = DataSource(shapefile)
            layer = ds[0]
            
            self.stdout.write(f'Layer: {layer.name}')
            self.stdout.write(f'Features: {len(layer)}')
            self.stdout.write(f'Fields: {layer.fields}')
            
            # Find susceptibility field
            suscept_field = None
            for field in layer.fields:
                if 'suscept' in field.lower():
                    suscept_field = field
                    break
            
            if not suscept_field:
                self.stdout.write(self.style.ERROR('No susceptibility field found!'))
                return
            
            self.stdout.write(f'Using field: {suscept_field}')
            
            proceed = input('\nProceed? (yes/no): ')
            if proceed.lower() != 'yes':
                return
            
            # Pre-load liquefaction zones
            self.stdout.write('\nLoading liquefaction zones...')
            liq_zones = []
            
            for feature in layer:
                geom = feature.geom.geos
                geom.srid = 4326
                suscept = str(feature.get(suscept_field)).strip().upper()
                liq_zones.append((geom, suscept))
            
            self.stdout.write(f'Loaded {len(liq_zones)} zones')
            
            # Process barangays
            updated = 0
            barangays = Barangay.objects.all()
            total = barangays.count()
            
            for idx, barangay in enumerate(barangays):
                try:
                    low_area = 0
                    med_area = 0
                    high_area = 0
                    very_high_area = 0
                    total_brgy_area = barangay.geometry.area
                    
                    for liq_geom, suscept in liq_zones:
                        try:
                            if barangay.geometry.intersects(liq_geom):
                                intersection = barangay.geometry.intersection(liq_geom)
                                intersection_area = intersection.area
                                
                                # Map susceptibility levels
                                if 'LOW' in suscept or suscept == 'L':
                                    low_area += intersection_area
                                elif 'MODERATE' in suscept or 'MEDIUM' in suscept or suscept == 'M':
                                    med_area += intersection_area
                                elif 'VERY HIGH' in suscept or suscept == 'VH':
                                    very_high_area += intersection_area
                                elif 'HIGH' in suscept or suscept == 'H':
                                    high_area += intersection_area
                        except:
                            continue
                    
                    # Calculate percentages
                    if total_brgy_area > 0 and (low_area > 0 or med_area > 0 or high_area > 0 or very_high_area > 0):
                        low_pct = (low_area / total_brgy_area) * 100
                        med_pct = (med_area / total_brgy_area) * 100
                        high_pct = (high_area / total_brgy_area) * 100
                        very_high_pct = (very_high_area / total_brgy_area) * 100
                        
                        # Update or create
                        liq, created = LiquefactionHazard.objects.get_or_create(
                            barangay=barangay
                        )
                        
                        liq.low_pct = low_pct
                        liq.med_pct = med_pct
                        liq.high_pct = high_pct
                        liq.very_high_pct = very_high_pct
                        liq.save()
                        
                        updated += 1
                    
                    if (idx + 1) % 50 == 0:
                        self.stdout.write(f'Processed {idx + 1}/{total}... ({updated} with data)')
                
                except Exception as e:
                    pass
            
            self.stdout.write('\n' + '='*70)
            self.stdout.write(self.style.SUCCESS(f'✓ Updated {updated} barangays'))
            
            # Sample
            sample = LiquefactionHazard.objects.filter(high_pct__gt=0).first()
            
            if sample:
                self.stdout.write(f'\n✓ Sample: {sample.barangay.name}')
                self.stdout.write(f'  High: {sample.high_pct:.1f}%')
                self.stdout.write(f'  Score: {sample.get_liquefaction_score():.1f}')
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))