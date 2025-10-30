from django.core.management.base import BaseCommand
from resilience.models import Barangay, BarangayHealthAccess
import pandas as pd
import os

class Command(BaseCommand):
    help = 'Load health facility data from CCHAIN'

    def handle(self, *args, **options):
        file_path = 'data/cchain/geoportal_doh_poi_health.csv'
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return
        
        self.stdout.write(f'Loading health facilities: {file_path}')
        
        df = pd.read_csv(file_path)
        self.stdout.write(f'✓ Loaded {len(df)} rows')
        
        proceed = input('\nProceed? (yes/no): ')
        if proceed.lower() != 'yes':
            return
        
        updated = 0
        
        for idx, row in df.iterrows():
            try:
                adm4_pcode = str(row['adm4_pcode']).strip()
                barangay = Barangay.objects.filter(adm4_pcode=adm4_pcode).first()
                
                if not barangay:
                    continue
                
                health_access, created = BarangayHealthAccess.objects.get_or_create(
                    barangay=barangay
                )
                
                health_access.hospital_count = int(row.get('doh_hospital_count', 0))
                health_access.hospital_nearest_km = row.get('doh_hospital_nearest')
                health_access.rhu_count = int(row.get('doh_rural_health_unit_count', 0))
                health_access.rhu_nearest_km = row.get('doh_rural_health_unit_nearest')
                health_access.health_station_count = int(row.get('doh_brgy_health_station_count', 0))
                health_access.health_station_nearest_km = row.get('doh_brgy_health_station_nearest')
                health_access.birthing_home_count = int(row.get('doh_birthing_home_lying_in_clinic_count', 0))
                health_access.birthing_home_nearest_km = row.get('doh_birthing_home_lying_in_clinic_nearest')
                
                health_access.save()
                updated += 1
                
                if updated % 50 == 0:
                    self.stdout.write(f'Updated {updated}...')
            
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Row {idx}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ Updated {updated} barangays'))