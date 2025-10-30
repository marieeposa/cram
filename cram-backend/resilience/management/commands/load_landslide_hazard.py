from django.core.management.base import BaseCommand
from resilience.models import Barangay, HazardExposure
import os

class Command(BaseCommand):
    help = 'Load landslide susceptibility shapefile'

    def add_arguments(self, parser):
        parser.add_argument('shapefile_path', type=str, help='Path to landslide shapefile')

    def handle(self, *args, **options):
        shapefile = options['shapefile_path']
        
        if not os.path.exists(shapefile):
            self.stdout.write(self.style.ERROR(f'File not found: {shapefile}'))
            return
        
        from django.contrib.gis.gdal import DataSource
        
        self.stdout.write(f'Loading landslide hazard: {shapefile}')
        
        ds = DataSource(shapefile)
        layer = ds[0]
        
        self.stdout.write(f'Layer: {layer.name}')
        self.stdout.write(f'Features: {len(layer)}')
        self.stdout.write(f'Fields: {layer.fields}')
        
        # Show sample
        if len(layer) > 0:
            first = layer[0]
            self.stdout.write('\nSample data:')
            for field in layer.fields[:5]:
                self.stdout.write(f'  {field}: {first.get(field)}')
        
        proceed = input('\nProceed? (yes/no): ')
        
        if proceed.lower() != 'yes':
            return
        
        self.stdout.write('\nProcessing landslide zones...')
        
        updated = 0
        total_barangays = Barangay.objects.count()
        
        # Score mapping
        score_map = {
            'Low': 1,
            'L': 1,
            'Medium': 2,
            'M': 2,
            'Moderate': 2,
            'High': 3,
            'H': 3,
            'Very High': 4,
            'VH': 4,
            'DF': 1,  # Debris Flow
        }
        
        # For each barangay, check intersection
        barangays = Barangay.objects.all()
        
        for idx, barangay in enumerate(barangays):
            try:
                highest_risk = None
                highest_score = 0
                
                # Check intersection with landslide zones
                for feature in layer:
                    landslide_geom = feature.geom.geos
                    
                    if barangay.geometry.intersects(landslide_geom):
                        # Get landslide susceptibility
                        landslide_susc = str(feature.get('LndslideSu')).strip() if 'LndslideSu' in layer.fields else None
                        
                        if landslide_susc and landslide_susc in score_map:
                            score = score_map[landslide_susc]
                            if score > highest_score:
                                highest_score = score
                                highest_risk = landslide_susc
                
                # Update or create landslide hazard record
                if highest_risk:
                    HazardExposure.objects.update_or_create(
                        barangay=barangay,
                        hazard_type='landslide',
                        defaults={
                            'susceptibility': highest_risk,
                            'susceptibility_score': highest_score,
                            'source': 'LDRRMD Landslide Hazard Map'
                        }
                    )
                    updated += 1
                
                if (idx + 1) % 50 == 0:
                    self.stdout.write(f'Processed {idx + 1}/{total_barangays}...')
            
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Error for {barangay.name}: {str(e)}'))
        
        self.stdout.write('\n' + '='*80)
        self.stdout.write(self.style.SUCCESS(f'✓ Updated landslide data for {updated} barangays'))
        
        # Show summary
        from django.db.models import Count
        stats = HazardExposure.objects.filter(hazard_type='landslide').values('susceptibility').annotate(
            count=Count('id')
        ).order_by('-count')
        
        self.stdout.write('\nLandslide susceptibility distribution:')
        for stat in stats:
            self.stdout.write(f"  {stat['susceptibility']}: {stat['count']} barangays")
            