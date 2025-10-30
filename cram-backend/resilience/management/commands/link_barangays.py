from django.core.management.base import BaseCommand
from resilience.models import Barangay, Municipality
import re

class Command(BaseCommand):
    help = 'Link barangays to their parent municipalities'

    def clean_municipality_name(self, name):
        """Clean and normalize municipality name for matching"""
        if not name:
            return ''
        
        name = str(name).upper().strip()
        
        # Remove "CITY OF" prefix
        name = re.sub(r'^CITY OF\s+', '', name)
        
        # Remove anything in parentheses
        name = re.sub(r'\([^)]*\)', '', name)
        
        # Remove extra whitespace
        name = ' '.join(name.split())
        
        return name

    def handle(self, *args, **options):
        self.stdout.write('Linking barangays to municipalities...')
        
        linked = 0
        not_found = 0
        errors = []
        
        barangays = Barangay.objects.all()
        total = barangays.count()
        
        self.stdout.write(f'Processing {total} barangays...')
        
        # Get all municipalities for fuzzy matching
        municipalities = list(Municipality.objects.all())
        
        for barangay in barangays:
            try:
                # Clean up barangay's municipality name
                brgy_mun_name = self.clean_municipality_name(barangay.municipality)
                
                if not brgy_mun_name:
                    not_found += 1
                    continue
                
                # Try exact match first
                municipality = None
                for mun in municipalities:
                    mun_name = self.clean_municipality_name(mun.name)
                    if mun_name == brgy_mun_name:
                        municipality = mun
                        break
                
                # If no exact match, try fuzzy matching
                if not municipality:
                    for mun in municipalities:
                        mun_name = self.clean_municipality_name(mun.name)
                        # Check if one contains the other
                        if mun_name in brgy_mun_name or brgy_mun_name in mun_name:
                            municipality = mun
                            break
                
                if municipality:
                    barangay.municipality_fk = municipality
                    barangay.save(update_fields=['municipality_fk'])
                    linked += 1
                    
                    if linked % 50 == 0:
                        self.stdout.write(f'Linked {linked}/{total}...')
                else:
                    not_found += 1
                    errors.append(f'{barangay.name} - Not found: "{barangay.municipality}" → "{brgy_mun_name}"')
            
            except Exception as e:
                not_found += 1
                errors.append(f'{barangay.name}: {str(e)}')
        
        # Summary
        self.stdout.write('\n' + '='*80)
        self.stdout.write(self.style.SUCCESS(f'✓ Linked {linked} barangays to municipalities'))
        if not_found > 0:
            self.stdout.write(self.style.WARNING(f'⚠ Could not link {not_found} barangays'))
        
        # Show statistics by municipality
        self.stdout.write('\nBarangays per municipality:')
        from django.db.models import Count
        stats = Municipality.objects.annotate(
            barangay_count=Count('barangays')
        ).order_by('-barangay_count')
        
        for mun in stats:
            if mun.barangay_count > 0:
                self.stdout.write(f'  {mun.name}: {mun.barangay_count} barangays')
        
        # Show unlinked barangays
        unlinked = Barangay.objects.filter(municipality_fk__isnull=True).count()
        if unlinked > 0:
            self.stdout.write(f'\n⚠ {unlinked} barangays still unlinked')
            
            # Show unique municipality names that weren't found
            unlinked_munis = Barangay.objects.filter(
                municipality_fk__isnull=True
            ).values_list('municipality', flat=True).distinct()
            
            self.stdout.write('\nMunicipality names that could not be matched:')
            for mun in list(unlinked_munis)[:20]:
                cleaned = self.clean_municipality_name(mun)
                self.stdout.write(f'  - Original: "{mun}"')
                self.stdout.write(f'    Cleaned:  "{cleaned}"')
        
        # Show errors if any
        if errors and len(errors) <= 10:
            self.stdout.write('\nDetailed errors:')
            for err in errors[:10]:
                self.stdout.write(f'  {err}')