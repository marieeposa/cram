from osgeo import ogr, osr
import os

# Set PROJ_LIB
os.environ['PROJ_LIB'] = r"C:\Users\otili\AppData\Local\Programs\OSGeo4W\share\proj"

shapefile = "data/shapefiles/negros_boundaries/negros_barangays.shp"

ds = ogr.Open(shapefile)
layer = ds.GetLayer()

# Get spatial reference
srs = layer.GetSpatialRef()

if srs:
    print("SRS Found:")
    print(srs.ExportToPrettyWkt())
    print("\n" + "="*60)
    
    # Try to identify the EPSG code
    srs.AutoIdentifyEPSG()
    epsg = srs.GetAuthorityCode(None)
    print(f"EPSG Code: {epsg if epsg else 'Unknown'}")
else:
    print("No SRS found in shapefile")

# Get a sample coordinate
feature = layer.GetNextFeature()
geom = feature.GetGeometryRef()
centroid = geom.Centroid()

print(f"\nSample coordinates:")
print(f"  X: {centroid.GetX()}")
print(f"  Y: {centroid.GetY()}")

# Try different common Philippine CRS
print("\n" + "="*60)
print("Testing transformations:")

test_crs = {
    'UTM 51N': 32651,
    'PRS92 Zone III': 3123,
    'PRS92 Zone IV': 3124,
    'PTM Zone 3': 3121,
}

for name, epsg_code in test_crs.items():
    try:
        source = osr.SpatialReference()
        source.ImportFromEPSG(epsg_code)
        
        target = osr.SpatialReference()
        target.ImportFromEPSG(4326)
        
        transform = osr.CoordinateTransformation(source, target)
        
        # Transform sample point
        point = ogr.Geometry(ogr.wkbPoint)
        point.AddPoint(centroid.GetX(), centroid.GetY())
        point.Transform(transform)
        
        lon, lat = point.GetX(), point.GetY()
        
        # Check if it's in Negros Oriental range (122-124 lon, 9-11 lat)
        if 122 < lon < 124 and 9 < lat < 11:
            print(f"✓ {name} (EPSG:{epsg_code}): ({lon:.4f}, {lat:.4f}) - LOOKS CORRECT!")
        else:
            print(f"✗ {name} (EPSG:{epsg_code}): ({lon:.4f}, {lat:.4f})")
    except Exception as e:
        print(f"✗ {name}: Error - {e}")