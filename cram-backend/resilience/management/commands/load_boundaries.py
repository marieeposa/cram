from django.core.management.base import BaseCommand
from resilience.models import Barangay
import os

class Command(BaseCommand):
    help = 'Load barangay boundaries (expects WGS84)'

    def add_arguments(self, parser):
        parser.add_argument('shapefile_path', type=str)
        parser.add_argument('--province', type=str, default='Negros Oriental')
        parser.add_argument('--region', type=str, default='Central Visayas')

    def handle(self, *args, **options):
        shapefile = options['shapefile_path']
        
        from django.contrib.gis.gdal import DataSource
        from django.contrib.gis.geos import MultiPolygon
        
        ds = DataSource(shapefile)
        layer = ds[0]
        
        self.stdout.write(f'Loading: {shapefile}')
        self.stdout.write(f'Features: {len(layer)}')
        
        proceed = input('\nProceed? (yes/no): ')
        if proceed.lower() != 'yes':
            return
        
        loaded = 0
        
        for feature in layer:
            try:
                name = feature.get('B_NAME')
                municipality = feature.get('LGU_NAME')
                psgc_code = feature.get('BRGYCODE')
                population = feature.get('POP_2020')
                
                geom = feature.geom.geos
                
                if geom.geom_type == 'Polygon':
                    geom = MultiPolygon(geom)
                
                geom.srid = 4326
                
                Barangay.objects.create(
                    psgc_code=psgc_code,
                    name=name,
                    municipality=municipality,
                    province=options['province'],
                    region=options['region'],
                    population=population,
                    geometry=geom
                )
                
                loaded += 1
                if loaded % 50 == 0:
                    self.stdout.write(f'{loaded}...')
                
            except Exception as e:
                self.stdout.write(f'Error: {name} - {str(e)}')
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ Loaded {loaded}'))
        
        # Verify
        sample = Barangay.objects.first()
        c = sample.geometry.centroid
        self.stdout.write(f'\n{sample.name}: ({c.x:.4f}, {c.y:.4f})')
        
        if 122 < c.x < 124 and 9 < c.y < 11:
            self.stdout.write(self.style.SUCCESS('✓✓✓ CORRECT!'))
        else:
            self.stdout.write(self.style.ERROR('✗✗✗ STILL WRONG'))