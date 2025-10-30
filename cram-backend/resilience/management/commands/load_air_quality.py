from django.core.management.base import BaseCommand
from resilience.models import Municipality, AirQualityData
import pandas as pd

class Command(BaseCommand):
    help = 'Load air quality data from CSV'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to air quality CSV')

    def handle(self, *args, **options):
        csv_file = options['csv_file']
        
        self.stdout.write(f'Loading: {csv_file}')
        
        try:
            # Read CSV
            df = pd.read_csv(csv_file)
            
            self.stdout.write(f'Found {len(df)} hourly readings')
            self.stdout.write(f'Cities: {df["city_name"].unique().tolist()}')
            
            # Extract year/month
            df['year'] = df['__month'].astype(str).str[:4].astype(int)
            df['month'] = df['__month'].astype(str).str[4:6].astype(int)
            
            proceed = input('\nProceed? (yes/no): ')
            if proceed.lower() != 'yes':
                return
            
            # Clear existing data
            AirQualityData.objects.all().delete()
            
            # Group by city, year, month
            grouped = df.groupby(['city_name', 'year', 'month']).agg({
                'main.aqi': 'mean',
                'components.pm2_5': 'mean',
                'components.pm10': 'mean',
                'components.o3': 'mean',
                'components.no2': 'mean',
                'components.co': 'mean',
                'timestamp': 'count'  # Count data points
            }).reset_index()
            
            # Rename timestamp count column
            grouped.rename(columns={'timestamp': 'data_points'}, inplace=True)
            
            loaded = 0
            
            for _, row in grouped.iterrows():
                try:
                    # Find municipality
                    city_name = row['city_name']
                    muni = Municipality.objects.filter(name__iexact=city_name).first()
                    if not muni:
                        muni = Municipality.objects.filter(name__iexact=f"{city_name} City").first()
                    
                    if not muni:
                        self.stdout.write(self.style.WARNING(f'Municipality not found: {row["city_name"]}'))
                        continue
                    
                    # Create record
                    AirQualityData.objects.create(
                        municipality=muni,
                        year=int(row['year']),
                        month=int(row['month']),
                        avg_aqi=row['main.aqi'],
                        avg_pm25=row['components.pm2_5'],
                        avg_pm10=row['components.pm10'],
                        avg_o3=row['components.o3'],
                        avg_no2=row['components.no2'],
                        avg_co=row['components.co'],
                        data_points=int(row['data_points'])
                    )
                    
                    loaded += 1
                
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'Error: {str(e)}'))
            
            self.stdout.write('\n' + '='*70)
            self.stdout.write(self.style.SUCCESS(f'✓ Loaded {loaded} monthly air quality records'))
            
            # Show sample
            sample = AirQualityData.objects.first()
            if sample:
                self.stdout.write(f'\n✓ Sample: {sample}')
                self.stdout.write(f'  PM2.5: {sample.avg_pm25:.1f} μg/m³')
                self.stdout.write(f'  AQI Score: {sample.get_air_quality_score()}/100')
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))