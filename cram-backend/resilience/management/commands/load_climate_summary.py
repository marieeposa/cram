from django.core.management.base import BaseCommand
from resilience.models import Municipality

class Command(BaseCommand):
    help = 'Load simple climate summary for Negros Oriental'

    def handle(self, *args, **options):
        self.stdout.write('Loading climate projections summary...')
        
        # Based on the CLIRAM Excel file analysis
        climate_summary = """
Climate Projections for Negros Oriental (2036-2099):

RAINFALL:
- Moderate Scenario (RCP4.5): -13% to +24% change
- High Emission (RCP8.5): -15% to +20% change
- Seasonal variability expected across DJF, MAM, JJA, SON

TEMPERATURE:
- Projected warming across all seasons
- Higher increases expected under high emission scenarios
- Impacts on agriculture, water resources, and health anticipated

Source: PAGASA CLIRAM Data
        """.strip()
        
        # Update all municipalities in Negros Oriental
        municipalities = Municipality.objects.filter(province='Negros Oriental')
        
        updated = 0
        for muni in municipalities:
            muni.climate_summary = climate_summary
            muni.rainfall_trend = 'Variable (±15-24%)'
            muni.temperature_trend = 'Increasing'
            muni.save()
            updated += 1
        
        self.stdout.write('='*70)
        self.stdout.write(self.style.SUCCESS(f'✓ Updated {updated} municipalities with climate projections'))
        self.stdout.write(f'\nSample: {municipalities.first().name}')
        self.stdout.write(f'  Rainfall: {municipalities.first().rainfall_trend}')
        self.stdout.write(f'  Temperature: {municipalities.first().temperature_trend}')