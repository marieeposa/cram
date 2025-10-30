from django.core.management.base import BaseCommand
from resilience.models import Barangay
import pandas as pd

class Command(BaseCommand):
    help = 'Link barangays to CCHAIN adm4_pcode'

    def handle(self, *args, **options):
        file_path = 'data/cchain/location.csv'
        
        df = pd.read_csv(file_path)
        
        self.stdout.write(f'Locations in CCHAIN: {len(df)}')
        self.stdout.write(f'Columns: {list(df.columns)}')
        
        # Show sample
        self.stdout.write('\nSample:')
        self.stdout.write(str(df[['adm4_en', 'adm4_pcode', 'adm3_en']].head()))
        
        proceed = input('\nProceed to match? (yes/no): ')
        if proceed.lower() != 'yes':
            return
        
        matched = 0
        
        for idx, row in df.iterrows():
            try:
                brgy_name = str(row['adm4_en']).strip()
                mun_name = str(row['adm3_en']).strip()
                adm4_pcode = str(row['adm4_pcode']).strip()
                
                # Try to find barangay
                barangay = Barangay.objects.filter(
                    name__iexact=brgy_name,
                    municipality__icontains=mun_name
                ).first()
                
                if barangay:
                    barangay.adm4_pcode = adm4_pcode
                    barangay.save(update_fields=['adm4_pcode'])
                    matched += 1
                    
                    if matched % 50 == 0:
                        self.stdout.write(f'Matched {matched}...')
            
            except Exception as e:
                pass
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ Matched {matched} barangays to CCHAIN codes'))
        
        # Show unmatched
        unmatched = Barangay.objects.filter(adm4_pcode__isnull=True).count()
        self.stdout.write(f'Unmatched: {unmatched}')