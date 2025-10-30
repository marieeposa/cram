from django.core.management.base import BaseCommand
from resilience.models import Barangay
import pandas as pd
import os

class Command(BaseCommand):
    help = 'Load PSA Census demographic data'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to census CSV file')

    def handle(self, *args, **options):
        file_path = options['file_path']
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return
        
        self.stdout.write(f'Reading file: {file_path}')
        
        try:
            df = pd.read_csv(file_path)
            
            # Filter only barangay-level records
            barangay_df = df[df['Level'] == 'Bgy'].copy()
            
            self.stdout.write(f'✓ Total rows: {len(df)}')
            self.stdout.write(f'✓ Barangay rows: {len(barangay_df)}')
            self.stdout.write(f'✓ Columns: {list(df.columns)}')
            
            # Show sample
            self.stdout.write('\nSample barangay data:')
            self.stdout.write(str(barangay_df[['Name', 'UrbanRural', 'Population']].head(10)))
            
            proceed = input('\nProceed with loading? (yes/no): ')
            
            if proceed.lower() != 'yes':
                self.stdout.write(self.style.WARNING('Cancelled.'))
                return
            
            updated = 0
            not_found = 0
            errors = []
            
            for idx, row in barangay_df.iterrows():
                try:
                    barangay_name = str(row['Name']).strip()
                    
                    if not barangay_name or barangay_name == 'nan':
                        continue
                    
                    # Try to find matching barangay
                    # First try exact match
                    barangay = Barangay.objects.filter(
                        name__iexact=barangay_name
                    ).first()
                    
                    if not barangay:
                        # Try partial match
                        barangay = Barangay.objects.filter(
                            name__icontains=barangay_name
                        ).first()
                    
                    if barangay:
                        # Update population if available
                        if pd.notna(row['Population']):
                            try:
                                barangay.population = int(row['Population'])
                            except:
                                pass
                        
                        # Store urban/rural classification if needed
                        # You can add a field to the model later for this
                        
                        barangay.save()
                        updated += 1
                        
                        if updated % 50 == 0:
                            self.stdout.write(f'Updated {updated} barangays...')
                    else:
                        not_found += 1
                        if not_found <= 10:  # Show first 10 not found
                            errors.append(f'Not found: {barangay_name}')
                
                except Exception as e:
                    errors.append(f'{barangay_name}: {str(e)}')
                    not_found += 1
            
            # Summary
            self.stdout.write('\n' + '='*80)
            self.stdout.write(self.style.SUCCESS(f'✓ Updated {updated} barangays with demographic data'))
            if not_found > 0:
                self.stdout.write(self.style.WARNING(f'⚠ Could not match {not_found} barangays'))
            
            # Show statistics
            total_pop = Barangay.objects.exclude(population__isnull=True).count()
            self.stdout.write(f'\nTotal barangays with population data: {total_pop}')
            
            if errors and len(errors) <= 20:
                self.stdout.write('\nSample errors/not found:')
                for err in errors[:20]:
                    self.stdout.write(f'  - {err}')
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
            import traceback
            self.stdout.write(traceback.format_exc())