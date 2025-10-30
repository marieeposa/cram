from django.core.management.base import BaseCommand
from resilience.models import Barangay, StormSurgeHazard
import os

class Command(BaseCommand):
    help = 'Load Storm Surge Advisory shapefiles (SSA1-4)'

    def add_arguments(self, parser):
        parser.add_argument('--folder', type=str, default='data/storm surge', 
                          help='Folder containing storm surge shapefiles')

    def handle(self, *args, **options):
        folder = options['folder']
        
        # Expected advisory files
        advisory_files = {
            'ssa1': None,
            'ssa2': None,
            'ssa3': None,
            'ssa4': None,
        }
        
        # Find all subfolders
        if not os.path.exists(folder):
            self.stdout.write(self.style.ERROR(f'Folder not found: {folder}'))
            return
        
        self.stdout.write(f'Scanning folder: {folder}')
        
        # Search in subfolders
        for subfolder in os.listdir(folder):
            subfolder_path = os.path.join(folder, subfolder)
            if os.path.isdir(subfolder_path):
                for file in os.listdir(subfolder_path):
                    if file.endswith('.shp'):
                        file_lower = file.lower()
                        
                        if 'ssa1' in file_lower or 'advisory 1' in subfolder.lower():
                            advisory_files['ssa1'] = os.path.join(subfolder_path, file)
                        elif 'ssa2' in file_lower or 'advisory 2' in subfolder.lower():
                            advisory_files['ssa2'] = os.path.join(subfolder_path, file)
                        elif 'ssa3' in file_lower or 'advisory 3' in subfolder.lower():
                            advisory_files['ssa3'] = os.path.join(subfolder_path, file)
                        elif 'ssa4' in file_lower or 'advisory 4' in subfolder.lower():
                            advisory_files['ssa4'] = os.path.join(subfolder_path, file)
        
        # Show what was found
        self.stdout.write('\n' + '='*70)
        for advisory, path in advisory_files.items():
            if path:
                self.stdout.write(self.style.SUCCESS(f'✓ {advisory.upper()}: {os.path.basename(path)}'))
            else:
                self.stdout.write(self.style.WARNING(f'✗ {advisory.upper()}: NOT FOUND'))
        
        proceed = input('\nProceed with loading? (yes/no): ')
        if proceed.lower() != 'yes':
            return
        
        from django.contrib.gis.gdal import DataSource
        
        # Process each advisory level
        for advisory, shapefile in advisory_files.items():
            if not shapefile:
                continue
            
            self.stdout.write(f'\n\nProcessing {advisory.upper()}...')
            
            try:
                ds = DataSource(shapefile)
                layer = ds[0]
                
                self.stdout.write(f'  Layer: {layer.name}')
                self.stdout.write(f'  Features: {len(layer)}')
                self.stdout.write(f'  Fields: {layer.fields}')
                
                # Find HAZ field
                hazard_field = None
                for field in layer.fields:
                    if 'haz' in field.lower():
                        hazard_field = field
                        break
                
                if not hazard_field:
                    self.stdout.write(self.style.WARNING(f'  No HAZ field found, skipping...'))
                    continue
                
                self.stdout.write(f'  Using field: {hazard_field}')
                
                # Pre-load surge zones
                surge_zones = []
                for feature in layer:
                    geom = feature.geom.geos
                    geom.srid = 4326
                    haz_value = feature.get(hazard_field)
                    surge_zones.append((geom, haz_value))
                
                self.stdout.write(f'  Loaded {len(surge_zones)} surge zones')
                
                # Process barangays
                updated = 0
                barangays = Barangay.objects.all()
                total = barangays.count()
                
                for idx, barangay in enumerate(barangays):
                    try:
                        low_area = 0
                        med_area = 0
                        high_area = 0
                        total_brgy_area = barangay.geometry.area
                        
                        for surge_geom, haz_value in surge_zones:
                            try:
                                if barangay.geometry.intersects(surge_geom):
                                    intersection = barangay.geometry.intersection(surge_geom)
                                    intersection_area = intersection.area
                                    
                                    # Convert to number
                                    if isinstance(haz_value, str):
                                        try:
                                            haz_value = float(haz_value)
                                        except:
                                            continue
                                    
                                    # Map values: 1=Low, 2=Medium, 3=High
                                    if haz_value == 1.0:
                                        low_area += intersection_area
                                    elif haz_value == 2.0:
                                        med_area += intersection_area
                                    elif haz_value == 3.0:
                                        high_area += intersection_area
                            except:
                                continue
                        
                        # Calculate percentages
                        if total_brgy_area > 0 and (low_area > 0 or med_area > 0 or high_area > 0):
                            low_pct = (low_area / total_brgy_area) * 100
                            med_pct = (med_area / total_brgy_area) * 100
                            high_pct = (high_area / total_brgy_area) * 100
                            
                            # Update or create
                            surge, created = StormSurgeHazard.objects.get_or_create(
                                barangay=barangay
                            )
                            
                            # Update correct advisory fields
                            if advisory == 'ssa1':
                                surge.ssa1_low_pct = low_pct
                                surge.ssa1_med_pct = med_pct
                                surge.ssa1_high_pct = high_pct
                            elif advisory == 'ssa2':
                                surge.ssa2_low_pct = low_pct
                                surge.ssa2_med_pct = med_pct
                                surge.ssa2_high_pct = high_pct
                            elif advisory == 'ssa3':
                                surge.ssa3_low_pct = low_pct
                                surge.ssa3_med_pct = med_pct
                                surge.ssa3_high_pct = high_pct
                            elif advisory == 'ssa4':
                                surge.ssa4_low_pct = low_pct
                                surge.ssa4_med_pct = med_pct
                                surge.ssa4_high_pct = high_pct
                            
                            surge.save()
                            updated += 1
                        
                        if (idx + 1) % 50 == 0:
                            self.stdout.write(f'  Processed {idx + 1}/{total}... ({updated} with data)')
                    
                    except Exception as e:
                        pass
                
                self.stdout.write(self.style.SUCCESS(f'  ✓ Updated {updated} barangays for {advisory.upper()}'))
            
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  Error: {str(e)}'))
        
        # Summary
        self.stdout.write('\n' + '='*70)
        self.stdout.write(self.style.SUCCESS('✓ Storm surge data loading complete!'))
        
        # Sample
        sample = StormSurgeHazard.objects.filter(ssa4_high_pct__gt=0).first()
        
        if sample:
            self.stdout.write(f'\n✓ Sample: {sample.barangay.name}')
            self.stdout.write(f'  SSA4 high: {sample.ssa4_high_pct:.1f}%')
            self.stdout.write(f'  Composite score: {sample.get_composite_storm_surge_score():.1f}')