from django.core.management.base import BaseCommand
from resilience.models import Barangay, BarangayClimateData
import pandas as pd
import os

class Command(BaseCommand):
    help = 'Load Project NOAH hazard data from CCHAIN'

    def handle(self, *args, **options):
        file_path = 'data/cchain/project_noah_hazards.csv'
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return
        
        self.stdout.write(f'Loading NOAH hazards from: {file_path}')
        
        df = pd.read_csv(file_path)
        
        self.stdout.write(f'✓ Loaded {len(df)} rows')
        self.stdout.write(f'✓ Columns: {list(df.columns)}')
        
        proceed = input('\nProceed? (yes/no): ')
        if proceed.lower() != 'yes':
            return
        
        updated = 0
        not_found = 0
        
        for idx, row in df.iterrows():
            try:
                adm4_pcode = str(row['adm4_pcode']).strip()
                
                # Find barangay by adm4_pcode (CCHAIN identifier)
                barangay = Barangay.objects.filter(
                    adm4_pcode=adm4_pcode
                ).first()
                
                if not barangay:
                    # Try matching by name if pcode doesn't work
                    not_found += 1
                    continue
                
                # Create or update climate data
                climate_data, created = BarangayClimateData.objects.get_or_create(
                    barangay=barangay
                )
                
                # Update NOAH hazard percentages
                climate_data.flood_100yr_low_pct = row.get('pct_area_flood_hazard_100yr_low')
                climate_data.flood_100yr_med_pct = row.get('pct_area_flood_hazard_100yr_med')
                climate_data.flood_100yr_high_pct = row.get('pct_area_flood_hazard_100yr_high')
                climate_data.flood_25yr_low_pct = row.get('pct_area_flood_hazard_25yr_low')
                climate_data.flood_25yr_med_pct = row.get('pct_area_flood_hazard_25yr_med')
                climate_data.flood_25yr_high_pct = row.get('pct_area_flood_hazard_25yr_high')
                climate_data.flood_5yr_low_pct = row.get('pct_area_flood_hazard_5yr_low')
                climate_data.flood_5yr_med_pct = row.get('pct_area_flood_hazard_5yr_med')
                climate_data.flood_5yr_high_pct = row.get('pct_area_flood_hazard_5yr_high')
                climate_data.landslide_low_pct = row.get('pct_area_landslide_hazard_low')
                climate_data.landslide_med_pct = row.get('pct_area_landslide_hazard_med')
                climate_data.landslide_high_pct = row.get('pct_area_landslide_hazard_high')
                
                climate_data.save()
                updated += 1
                
                if updated % 50 == 0:
                    self.stdout.write(f'Updated {updated}...')
            
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Row {idx}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ Updated {updated} barangays'))
        self.stdout.write(self.style.WARNING(f'⚠ Not found: {not_found}'))