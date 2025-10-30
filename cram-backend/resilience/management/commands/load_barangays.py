from django.core.management.base import BaseCommand
from django.contrib.gis.utils import LayerMapping
from resilience.models import Barangay

class Command(BaseCommand):
    help = 'Load barangay boundaries from shapefile'

    def add_arguments(self, parser):
        parser.add_argument('shapefile_path', type=str)

    def handle(self, *args, **options):
        shapefile = options['shapefile_path']
        
        # Map shapefile fields to model fields
        # Adjust these based on your actual shapefile
        mapping = {
            'name': 'BRGY_NAME',  # adjust to your field names
            'municipality': 'MUN_NAME',
            'province': 'PROV_NAME',
            'geometry': 'MULTIPOLYGON',
        }
        
        lm = LayerMapping(Barangay, shapefile, mapping, transform=False)
        lm.save(verbose=True)
        
        self.stdout.write(self.style.SUCCESS('Successfully loaded barangays'))