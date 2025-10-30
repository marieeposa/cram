from django.core.management.base import BaseCommand
from resilience.models import Barangay, HazardExposure
import os

class Command(BaseCommand):
    help = 'Load flood susceptibility shapefile'

    def add_arguments(self, parser):
        parser.add_argument('shapefile_path', type=str, help='Path to flood shapefile')

    def handle(self, *args, **options):
        shapefile = options['shapefile_path']
        
        if not os.path.exists(shapefile):
            self.stdout.write(self.style.ERROR(f'File not found: {shapefile}'))
            return
        
        from django.contrib.gis.gdal import DataSource
        from django.contrib.gis.geos import GEOSGeometry
        
        self.stdout.write(f'Loading flood hazard: {shapefile}')
        
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
        
        self.stdout.write('\nProcessing flood zones...')
        
        updated = 0
        total_barangays = Barangay.objects.count()
        
        # Score mapping
        score_map = {
            'Low': 1,
            'LF': 1,
            'Medium': 2,
            'MF': 2,
            'Moderate': 2,
            'High': 3,
            'HF': 3,
            'Very High': 4,
            'VHF': 4,
            'VF': 4,
            'DF': 1,  # Debris Flow = Low
        }
        
        # For each barangay, check which flood zone it intersects
        barangays = Barangay.objects.all()
        
        for idx, barangay in enumerate(barangays):
            try:
                highest_risk = None
                highest_score = 0
                
                # Check intersection with flood zones
                for feature in layer:
                    flood_geom = feature.geom.geos
                    
                    if barangay.geometry.intersects(flood_geom):
                        # Get flood susceptibility
                        flood_susc = str(feature.get('FloodSusc')).strip() if 'FloodSusc' in layer.fields else None
                        
                        if flood_susc and flood_susc in score_map:
                            score = score_map[flood_susc]
                            if score > highest_score:
                                highest_score = score
                                highest_risk = flood_susc
                
                # Update or create flood hazard record
                if highest_risk:
                    HazardExposure.objects.update_or_create(
                        barangay=barangay,
                        hazard_type='flood',
                        defaults={
                            'susceptibility': highest_risk,
                            'susceptibility_score': highest_score,
                            'source': 'LDRRMD Flood Hazard Map'
                        }
                    )
                    updated += 1
                
                if (idx + 1) % 50 == 0:
                    self.stdout.write(f'Processed {idx + 1}/{total_barangays}...')
            
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Error for {barangay.name}: {str(e)}'))
        
        self.stdout.write('\n' + '='*80)
        self.stdout.write(self.style.SUCCESS(f'✓ Updated flood data for {updated} barangays'))