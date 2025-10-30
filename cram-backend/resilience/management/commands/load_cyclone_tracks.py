from django.core.management.base import BaseCommand
from resilience.models import TropicalCycloneTrack
import json
from django.contrib.gis.geos import LineString

class Command(BaseCommand):
    help = 'Load tropical cyclone tracks from GeoJSON'

    def add_arguments(self, parser):
        parser.add_argument('geojson_file', type=str, help='Path to GeoJSON file')

    def handle(self, *args, **options):
        geojson_file = options['geojson_file']
        
        self.stdout.write(f'Loading: {geojson_file}')
        
        try:
            with open(geojson_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            features = data['features']
            self.stdout.write(f'Found {len(features)} cyclone tracks for 2024')
            
            proceed = input('\nProceed? (yes/no): ')
            if proceed.lower() != 'yes':
                return
            
            # Clear existing tracks
            TropicalCycloneTrack.objects.all().delete()
            
            loaded = 0
            negros_affected = 0
            
            for feature in features:
                try:
                    props = feature['properties']
                    geom = feature['geometry']
                    
                    # Create LineString
                    coords = geom['coordinates']
                    line = LineString(coords, srid=4326)
                    
                    # Create track
                    track = TropicalCycloneTrack.objects.create(
                        name=props.get('name', 'Unknown'),
                        category=props.get('category'),
                        begin_index=props.get('begin', 0),
                        end_index=props.get('end', 0),
                        track=line
                    )
                    
                    # Check if affects Negros
                    if track.affects_negros_oriental():
                        track.affected_negros = True
                        track.save()
                        negros_affected += 1
                    
                    loaded += 1
                
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'Error: {str(e)}'))
            
            self.stdout.write('\n' + '='*70)
            self.stdout.write(self.style.SUCCESS(f'✓ Loaded {loaded} cyclone tracks'))
            self.stdout.write(f'✓ {negros_affected} cyclones affected Negros Oriental region')
            
            # Show affecting cyclones
            affected = TropicalCycloneTrack.objects.filter(affected_negros=True)
            
            if affected:
                self.stdout.write('\nCyclones affecting Negros Oriental in 2024:')
                for tc in affected:
                    self.stdout.write(f'  - {tc.name} ({tc.category or "No category"})')
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))