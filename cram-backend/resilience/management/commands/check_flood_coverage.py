from django.core.management.base import BaseCommand
from resilience.models import Barangay
import os

class Command(BaseCommand):
    help = 'Check flood shapefile coverage'

    def add_arguments(self, parser):
        parser.add_argument('shapefile_path', type=str)

    def handle(self, *args, **options):
        shapefile = options['shapefile_path']
        
        from django.contrib.gis.gdal import DataSource
        
        ds = DataSource(shapefile)
        layer = ds[0]
        
        self.stdout.write(f'Flood layer info:')
        self.stdout.write(f'  SRS: {layer.srs}')
        self.stdout.write(f'  Extent: {layer.extent}')
        
        # Check a few barangays
        self.stdout.write('\nSample barangay info:')
        barangays = Barangay.objects.all()[:5]
        
        for brgy in barangays:
            self.stdout.write(f'\n{brgy.name}:')
            self.stdout.write(f'  Centroid: {brgy.geometry.centroid}')
            self.stdout.write(f'  Bounds: {brgy.geometry.extent}')
        
        # Check first flood zone
        if len(layer) > 0:
            flood_geom = layer[0].geom
            self.stdout.write(f'\nFirst flood zone:')
            self.stdout.write(f'  FloodSusc: {layer[0].get("FloodSusc")}')
            self.stdout.write(f'  Extent: {flood_geom.extent}')
            self.stdout.write(f'  SRID: {flood_geom.srid}')
            
            # Try transforming flood geometry
            try:
                flood_geos = flood_geom.geos
                self.stdout.write(f'  Centroid: {flood_geos.centroid}')
            except Exception as e:
                self.stdout.write(f'  Error: {e}')