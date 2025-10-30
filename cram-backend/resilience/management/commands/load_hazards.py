from django.core.management.base import BaseCommand
from resilience.models import Barangay, HazardExposure
import pandas as pd
import os

class Command(BaseCommand):
    help = 'Load hazard data from NEGOR HAZARDS Excel file'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to hazard Excel file')

    def handle(self, *args, **options):
        file_path = options['file_path']
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return
        
        self.stdout.write(f'Reading file: {file_path}')
        
        try:
            # Read Excel file with multi-level headers
            df = pd.read_excel(file_path, header=[0, 1])
            
            self.stdout.write(f'\n✓ Loaded {len(df)} rows')
            self.stdout.write(f'✓ Column structure:')
            for col in df.columns[:10]:  # Show first 10 columns
                self.stdout.write(f'  {col}')
            
            # Show sample data
            self.stdout.write('\nFirst 5 rows:')
            self.stdout.write(str(df.head()))
            
            self.stdout.write('\n' + '='*80)
            self.stdout.write(self.style.WARNING('NOTE: This appears to be MUNICIPALITY-level data.'))
            self.stdout.write('The script will apply the hazard data to ALL barangays in each municipality.')
            self.stdout.write('='*80)
            
            proceed = input('\nProceed with loading? (yes/no): ')
            
            if proceed.lower() != 'yes':
                self.stdout.write(self.style.WARNING('Cancelled.'))
                return
            
            # Parse the complex header structure manually
            # Re-read with simpler approach
            df_raw = pd.read_excel(file_path)
            
            # Get the actual hazard columns from row 1 (index 0)
            hazard_row = df_raw.iloc[0]
            
            # Map column indices to hazard names and types
            hazard_mapping = {}
            
            # Detect hazard columns
            for idx, col_name in enumerate(df_raw.columns):
                hazard_name = df_raw.iloc[0, idx]
                
                if pd.notna(hazard_name):
                    hazard_name_str = str(hazard_name).strip().lower()
                    
                    # Map to our hazard types
                    if 'flood' in hazard_name_str:
                        hazard_mapping[col_name] = ('flood', hazard_name)
                    elif 'landslide' in hazard_name_str or 'land slide' in hazard_name_str:
                        hazard_mapping[col_name] = ('landslide', hazard_name)
                    elif 'storm surge' in hazard_name_str or 'surge' in hazard_name_str:
                        hazard_mapping[col_name] = ('storm_surge', hazard_name)
                    elif 'wind' in hazard_name_str or 'typhoon' in hazard_name_str or 'cyclone' in hazard_name_str:
                        hazard_mapping[col_name] = ('cyclone', hazard_name)
                    else:
                        # Store other hazards too
                        hazard_mapping[col_name] = ('other', hazard_name)
            
            self.stdout.write(f'\n✓ Detected {len(hazard_mapping)} hazard columns')
            for col, (htype, hname) in list(hazard_mapping.items())[:5]:
                self.stdout.write(f'  - {hname} → {htype}')
            
            # Start processing from row 2 (skip header rows)
            data_df = df_raw.iloc[2:].reset_index(drop=True)
            
            loaded_municipalities = 0
            loaded_barangays = 0
            skipped = 0
            errors = []
            
            # Get municipality column (first column)
            municipality_col = data_df.columns[0]
            
            for idx, row in data_df.iterrows():
                try:
                    municipality_name = row[municipality_col]
                    
                    if pd.isna(municipality_name) or str(municipality_name).strip() == '':
                        skipped += 1
                        continue
                    
                    municipality_name = str(municipality_name).strip()
                    
                    # Find all barangays in this municipality
                    barangays = Barangay.objects.filter(
                        municipality__icontains=municipality_name
                    )
                    
                    if not barangays.exists():
                        errors.append(f"Municipality not found: {municipality_name}")
                        skipped += 1
                        continue
                    
                    # Process each hazard column
                    hazards_added = 0
                    for col, (hazard_type, hazard_name) in hazard_mapping.items():
                        if col in row.index and pd.notna(row[col]):
                            value = str(row[col]).strip().upper()
                            
                            # Check if hazard is present (P = Present)
                            if value == 'P':
                                # Apply to all barangays in this municipality
                                for barangay in barangays:
                                    HazardExposure.objects.update_or_create(
                                        barangay=barangay,
                                        hazard_type=hazard_type if hazard_type != 'other' else 'flood',
                                        defaults={
                                            'susceptibility': 'Present',
                                            'susceptibility_score': 2,  # Default to Medium
                                            'source': 'LDRRMD - Municipality Level'
                                        }
                                    )
                                    hazards_added += 1
                    
                    if hazards_added > 0:
                        loaded_municipalities += 1
                        loaded_barangays += barangays.count()
                        self.stdout.write(f'✓ {municipality_name}: {barangays.count()} barangays')
                
                except Exception as e:
                    error_msg = f'Row {idx} ({municipality_name if "municipality_name" in locals() else "Unknown"}): {str(e)}'
                    errors.append(error_msg)
                    skipped += 1
            
            # Summary
            self.stdout.write('\n' + '='*80)
            self.stdout.write(self.style.SUCCESS(f'✓ Processed {loaded_municipalities} municipalities'))
            self.stdout.write(self.style.SUCCESS(f'✓ Applied hazard data to {loaded_barangays} barangays'))
            if skipped > 0:
                self.stdout.write(self.style.WARNING(f'⚠ Skipped {skipped} rows'))
            
            # Show hazard statistics
            self.stdout.write('\nHazard exposure summary:')
            from django.db.models import Count
            hazard_stats = HazardExposure.objects.values('hazard_type').annotate(
                count=Count('id')
            ).order_by('-count')
            
            for stat in hazard_stats:
                self.stdout.write(f"  {stat['hazard_type']}: {stat['count']} barangays")
            
            # Show errors
            if errors:
                self.stdout.write(f'\n⚠ Errors: {len(errors)}')
                for err in errors[:10]:
                    self.stdout.write(f'  - {err}')
                if len(errors) > 10:
                    self.stdout.write(f'  ... and {len(errors) - 10} more')
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
            import traceback
            self.stdout.write(traceback.format_exc())