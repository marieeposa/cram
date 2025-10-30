from django.core.management.base import BaseCommand
from resilience.models import Barangay, NOAHFloodHazard
import os

class Command(BaseCommand):
    help = 'Load NOAH flood hazard shapefiles (5yr, 25yr, 100yr)'

    def add_arguments(self, parser):
        parser.add_argument('--folder', type=str, default='data/noah flood', 
                          help='Folder containing NOAH flood shapefiles')

    def handle(self, *args, **options):
        folder = options['folder']
        
        # Expected file patterns
        flood_files = {
            '5yr': None,
            '25yr': None,
            '100yr': None,
        }
        
        # Find files
        if not os.path.exists(folder):
            self.stdout.write(self.style.ERROR(f'Folder not found: {folder}'))
            return
        
        self.stdout.write(f'Scanning folder: {folder}')
        
        for file in os.listdir(folder):
            if file.endswith('.shp') and 'wgs84' not in file.lower():
                self.stdout.write(f'  Found: {file}')
                
                # Match return periods
                file_lower = file.lower()
                if '100' in file_lower and ('year' in file_lower or 'yr' in file_lower):
                    flood_files['100yr'] = os.path.join(folder, file)
                elif '25' in file_lower and ('year' in file_lower or 'yr' in file_lower):
                    flood_files['25yr'] = os.path.join(folder, file)
                elif '5' in file_lower and ('year' in file_lower or 'yr' in file_lower):
                    flood_files['5yr'] = os.path.join(folder, file)
        
        # Show what was found
        self.stdout.write('\n' + '='*70)
        for period, path in flood_files.items():
            if path:
                self.stdout.write(self.style.SUCCESS(f'✓ {period}: {os.path.basename(path)}'))
            else:
                self.stdout.write(self.style.WARNING(f'✗ {period}: NOT FOUND'))
        
        proceed = input('\nProceed with loading? (yes/no): ')
        if proceed.lower() != 'yes':
            return
        
        from django.contrib.gis.gdal import DataSource
        
        # Process each return period
        for period, shapefile in flood_files.items():
            if not shapefile:
                continue
            
            self.stdout.write(f'\n\nProcessing {period} return period...')
            
            try:
                ds = DataSource(shapefile)
                layer = ds[0]
                
                self.stdout.write(f'  Layer: {layer.name}')
                self.stdout.write(f'  Features: {len(layer)}')
                self.stdout.write(f'  Fields: {layer.fields}')
                self.stdout.write(f'  Extent: {layer.extent}')
                
                # Determine hazard field name
                hazard_field = None
                for field in layer.fields:
                    if 'hazard' in field.lower() or 'suscept' in field.lower() or 'var' in field.lower():
                        hazard_field = field
                        break
                
                if not hazard_field:
                    self.stdout.write(self.style.WARNING(f'  Could not find hazard field, skipping...'))
                    continue
                
                self.stdout.write(f'  Using field: {hazard_field}')
                
                # Pre-load all flood geometries for this return period
                self.stdout.write('  Loading flood zones into memory...')
                flood_zones = []
                for feature in layer:
                    geom = feature.geom
                    # NO TRANSFORM - already WGS84!
                    geos_geom = geom.geos
                    geos_geom.srid = 4326
                    
                    # Get numeric hazard value (1=Low, 2=Medium, 3=High)
                    hazard_value = feature.get(hazard_field)
                    flood_zones.append((geos_geom, hazard_value))
                
                self.stdout.write(f'  Loaded {len(flood_zones)} flood zones')
                
                # Process each barangay
                updated = 0
                barangays = Barangay.objects.all()
                total = barangays.count()
                
                for idx, barangay in enumerate(barangays):
                    try:
                        # Calculate intersection areas
                        low_area = 0
                        med_area = 0
                        high_area = 0
                        total_brgy_area = barangay.geometry.area
                        
                        for flood_geom, hazard_value in flood_zones:
                            try:
                                if barangay.geometry.intersects(flood_geom):
                                    intersection = barangay.geometry.intersection(flood_geom)
                                    intersection_area = intersection.area
                                    
                                    # Convert to number if string
                                    if isinstance(hazard_value, str):
                                        try:
                                            hazard_value = float(hazard_value)
                                        except:
                                            continue
                                    
                                    # Map numeric values: 1=Low, 2=Medium, 3=High
                                    if hazard_value == 1.0:
                                        low_area += intersection_area
                                    elif hazard_value == 2.0:
                                        med_area += intersection_area
                                    elif hazard_value == 3.0:
                                        high_area += intersection_area
                            except Exception as e:
                                # Skip problematic intersections
                                continue
                        
                        # Calculate percentages
                        if total_brgy_area > 0 and (low_area > 0 or med_area > 0 or high_area > 0):
                            low_pct = (low_area / total_brgy_area) * 100
                            med_pct = (med_area / total_brgy_area) * 100
                            high_pct = (high_area / total_brgy_area) * 100
                            
                            # Update or create record
                            noah_flood, created = NOAHFloodHazard.objects.get_or_create(
                                barangay=barangay
                            )
                            
                            # Update correct return period fields
                            if period == '5yr':
                                noah_flood.flood_5yr_low_pct = low_pct
                                noah_flood.flood_5yr_med_pct = med_pct
                                noah_flood.flood_5yr_high_pct = high_pct
                            elif period == '25yr':
                                noah_flood.flood_25yr_low_pct = low_pct
                                noah_flood.flood_25yr_med_pct = med_pct
                                noah_flood.flood_25yr_high_pct = high_pct
                            elif period == '100yr':
                                noah_flood.flood_100yr_low_pct = low_pct
                                noah_flood.flood_100yr_med_pct = med_pct
                                noah_flood.flood_100yr_high_pct = high_pct
                            
                            noah_flood.save()
                            updated += 1
                        
                        if (idx + 1) % 50 == 0:
                            self.stdout.write(f'  Processed {idx + 1}/{total}... ({updated} with data)')
                    
                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f'  Error: {barangay.name} - {str(e)}'))
                
                self.stdout.write(self.style.SUCCESS(f'  ✓ Updated {updated} barangays for {period}'))
            
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  Error loading {period}: {str(e)}'))
        
        # Show summary
        self.stdout.write('\n' + '='*70)
        self.stdout.write(self.style.SUCCESS('✓ NOAH flood data loading complete!'))
        
        # Sample verification with actual data
        sample = NOAHFloodHazard.objects.filter(
            flood_25yr_high_pct__gt=0
        ).first()
        
        if sample:
            self.stdout.write(f'\n✓ Sample with flood data: {sample.barangay.name}')
            self.stdout.write(f'  5yr high: {sample.flood_5yr_high_pct:.1f}%')
            self.stdout.write(f'  25yr high: {sample.flood_25yr_high_pct:.1f}%')
            self.stdout.write(f'  100yr high: {sample.flood_100yr_high_pct:.1f}%')
            self.stdout.write(f'  Composite score: {sample.get_composite_flood_score():.1f}')
        else:
            self.stdout.write(self.style.WARNING('\n⚠ No barangays with flood data found!'))
            self.stdout.write('   This may indicate coordinate system mismatch.')