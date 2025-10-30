from django.contrib.gis.gdal import DataSource
from resilience.models import Barangay

# Load one barangay
brgy = Barangay.objects.first()
print(f"Testing barangay: {brgy.name}")
print(f"Barangay extent: {brgy.geometry.extent}")
print(f"Barangay SRID: {brgy.geometry.srid}")

# Load NOAH file
ds = DataSource('data/noah flood/NegrosOriental_Flood_25year.shp')
layer = ds[0]

print(f"\nNOAH flood zones: {len(layer)}")

for i, feature in enumerate(layer):
    geom = feature.geom
    print(f"\nZone {i+1}:")
    print(f"  Original extent: {geom.extent}")
    print(f"  Original SRS: {geom.srs}")
    
    # Try WITHOUT transformation
    geos_geom = geom.geos
    geos_geom.srid = 4326
    
    print(f"  GEOS extent: {geos_geom.extent}")
    print(f"  GEOS SRID: {geos_geom.srid}")
    
    # Test intersection
    try:
        intersects = brgy.geometry.intersects(geos_geom)
        print(f"  Intersects with {brgy.name}? {intersects}")
        
        if intersects:
            intersection = brgy.geometry.intersection(geos_geom)
            print(f"  Intersection area: {intersection.area}")
    except Exception as e:
        print(f"  Error testing intersection: {e}")