# 📊 CRAM Data Documentation

Complete guide to data files, sources, and setup for the Climate Resilience Action Matrix.

---

## 📥 Data Repository

**All data files are stored in Google Drive:**

🔗 **Link:** https://drive.google.com/drive/folders/1axE500Yv-WhtxLzNXc8321WtM2GPSbaX

**Total Size:** ~2GB  
**Last Updated:** October 2025

---

## 📁 Data Structure
```
data/
├── shapefiles/
│   ├── barangays/
│   │   ├── NegrosOriental_Barangays.shp
│   │   ├── NegrosOriental_Barangays.shx
│   │   ├── NegrosOriental_Barangays.dbf
│   │   └── NegrosOriental_Barangays.prj
│   │
│   ├── municipalities/
│   │   └── NegrosOriental_Municipalities.shp
│   │
│   └── noah_flood/
│       ├── NegrosOriental_Flood_100year.shp
│       ├── NegrosOriental_Flood_25year.shp
│       └── NegrosOriental_Flood_5year.shp
│
├── cchain/
│   ├── climate_atmosphere.csv (543 MB)
│   ├── climate_land.csv (256 MB)
│   ├── climate_air_quality.csv (435 MB)
│   └── climate_atmosphere_downscaled.csv (232 MB)
│
├── census/
│   ├── psa_2020_barangay.csv
│   ├── psa_2020_municipality.csv
│   └── population_projections.csv
│
├── hazards/
│   ├── liquefaction.shp
│   ├── storm_surge.shp
│   └── landslide.shp
│
└── README.md
```

---

## 📋 Data Files Description

### 1. Shapefiles

#### Barangay Boundaries
**File:** `shapefiles/barangays/NegrosOriental_Barangays.shp`

| Attribute | Description | Data Type |
|-----------|-------------|-----------|
| `BRGY_NAME` | Barangay name | String |
| `MUN_NAME` | Municipality name | String |
| `PROV_NAME` | Province (Negros Oriental) | String |
| `AREA_HA` | Area in hectares | Float |
| `PERIMETER` | Perimeter in meters | Float |
| `geometry` | Polygon geometry | MultiPolygon |

**Source:** NOAH, PSA  
**Coordinate System:** WGS 84 (EPSG:4326)  
**Coverage:** 516 barangays

---

#### NOAH Flood Data
**Files:** `shapefiles/noah_flood/NegrosOriental_Flood_*.shp`

**Return Periods:**
- 5-year flood
- 25-year flood
- 100-year flood

| Attribute | Description | Values |
|-----------|-------------|--------|
| `FLOOD_VAR` | Flood susceptibility | Low, Medium, High |
| `DEPTH_M` | Flood depth (meters) | 0.0 - 5.0+ |
| `geometry` | Flood area polygon | MultiPolygon |

**Source:** DOST-PHIVOLCS NOAH Project  
**Resolution:** 1:10,000

---

### 2. Climate Data (CSV)

#### Atmosphere Data
**File:** `cchain/climate_atmosphere.csv` (543 MB)

| Column | Description | Unit |
|--------|-------------|------|
| `timestamp` | Date and time | ISO 8601 |
| `temperature` | Air temperature | °C |
| `humidity` | Relative humidity | % |
| `pressure` | Atmospheric pressure | hPa |
| `wind_speed` | Wind speed | m/s |
| `rainfall` | Precipitation | mm |

**Records:** 5,000,000+  
**Temporal Coverage:** 2010-2025  
**Frequency:** Hourly

---

#### Land Data
**File:** `cchain/climate_land.csv` (256 MB)

| Column | Description | Unit |
|--------|-------------|------|
| `date` | Date | YYYY-MM-DD |
| `soil_moisture` | Soil moisture content | % |
| `land_temp` | Land surface temperature | °C |
| `vegetation` | NDVI index | 0-1 |

---

#### Air Quality Data
**File:** `cchain/climate_air_quality.csv` (435 MB)

| Column | Description | Unit |
|--------|-------------|------|
| `timestamp` | Date and time | ISO 8601 |
| `pm25` | PM2.5 concentration | μg/m³ |
| `pm10` | PM10 concentration | μg/m³ |
| `o3` | Ozone level | ppb |
| `no2` | Nitrogen dioxide | ppb |
| `aqi` | Air Quality Index | 0-500 |

---

### 3. Census Data (CSV)

#### PSA 2020 Barangay Data
**File:** `census/psa_2020_barangay.csv`

| Column | Description | Data Type |
|--------|-------------|-----------|
| `barangay_name` | Barangay name | String |
| `municipality` | Municipality | String |
| `population` | Total population | Integer |
| `households` | Number of households | Integer |
| `male` | Male population | Integer |
| `female` | Female population | Integer |
| `age_0_14` | Population aged 0-14 | Integer |
| `age_15_64` | Population aged 15-64 | Integer |
| `age_65plus` | Population aged 65+ | Integer |

**Source:** Philippine Statistics Authority (PSA)  
**Year:** 2020 Census  
**Coverage:** 516 barangays

---

### 4. Hazard Data

#### Liquefaction
**File:** `hazards/liquefaction.shp`

| Attribute | Description | Values |
|-----------|-------------|--------|
| `LIQ_SUSC` | Liquefaction susceptibility | Low, Moderate, High |
| `geometry` | Area polygon | MultiPolygon |

**Source:** MGB-PHIVOLCS

---

#### Storm Surge
**File:** `hazards/storm_surge.shp`

| Attribute | Description | Values |
|-----------|-------------|--------|
| `SS_HEIGHT` | Storm surge height | 0-5+ meters |
| `CATEGORY` | Typhoon category | 1-5 |
| `geometry` | Coastal area polygon | MultiPolygon |

**Source:** PAGASA

---

## 🔧 Data Setup Instructions

### Step 1: Download Data

1. Visit Google Drive link: https://drive.google.com/drive/folders/1axE500Yv-WhtxLzNXc8321WtM2GPSbaX
2. Click "Download all" or select individual folders
3. Extract to your local machine

---

### Step 2: Place Data Files
```bash
# Navigate to backend directory
cd cram/cram-backend

# Create data directory if it doesn't exist
mkdir -p data

# Copy downloaded files to data directory
# Windows:
xcopy /E /I "C:\Users\YourName\Downloads\data" "data"

# macOS/Linux:
cp -R ~/Downloads/data/* data/
```

---

### Step 3: Verify Data Structure
```bash
# Check data folder structure
ls -R data/

# Should show:
# data/shapefiles/
# data/cchain/
# data/census/
# data/hazards/
```

---

### Step 4: Import Shapefiles to PostgreSQL
```bash
# Activate virtual environment
source venv/bin/activate  # Windows: venv\Scripts\activate

# Import barangays
python manage.py import_shapefiles --type=barangays --file=data/shapefiles/barangays/NegrosOriental_Barangays.shp

# Import flood data
python manage.py import_shapefiles --type=flood --file=data/shapefiles/noah_flood/NegrosOriental_Flood_100year.shp

# Import other hazards
python manage.py import_shapefiles --type=liquefaction --file=data/hazards/liquefaction.shp
```

---

### Step 5: Load CSV Data
```bash
# Load census data
python manage.py load_census data/census/psa_2020_barangay.csv

# Load climate data (this may take time)
python manage.py load_climate data/cchain/climate_atmosphere.csv
python manage.py load_climate data/cchain/climate_air_quality.csv
```

---

## 📊 Data Sources

### Government Agencies

**NOAH (Nationwide Operational Assessment of Hazards)**
- Website: https://noah.up.edu.ph/
- Agency: DOST-PHIVOLCS
- License: Open Data

**Philippine Statistics Authority (PSA)**
- Website: https://psa.gov.ph/
- Data: 2020 Census
- License: Creative Commons

**MGB (Mines and Geosciences Bureau)**
- Website: https://mgb.gov.ph/
- Agency: DENR
- Data: Geohazard maps

**PAGASA**
- Website: https://www.pagasa.dost.gov.ph/
- Agency: DOST
- Data: Storm surge, climate

---

## 🔒 Data Privacy & Security

### Personal Data Protection

This dataset contains **aggregated, non-identifiable data only**. No personal information is included.

**Compliance:**
- ✅ Data Privacy Act of 2012 (RA 10173)
- ✅ Open Data Philippines
- ✅ Statistical confidentiality (PSA)

### Data Usage Guidelines

**Allowed:**
- ✅ Research and academic use
- ✅ Government disaster planning
- ✅ Public awareness campaigns
- ✅ App development for public benefit

**Not Allowed:**
- ❌ Commercial sale of data
- ❌ Misrepresentation of data
- ❌ Use for discrimination

---

## 🔄 Data Updates

### Update Frequency

| Data Type | Update Frequency | Next Update |
|-----------|-----------------|-------------|
| Census | Every 5 years | 2025 |
| Hazard Maps | Annually | 2026 |
| Climate Data | Real-time | Continuous |
| Air Quality | Real-time | Continuous |

### How to Update Data

1. Download latest data from sources
2. Replace files in `data/` folder
3. Re-run import scripts
4. Update `DATA.md` with changes
5. Commit changes to Git

---

## 🆘 Troubleshooting

### Issue: Shapefile won't import

**Solution:**
```bash
# Check shapefile validity
ogrinfo data/shapefiles/barangays/NegrosOriental_Barangays.shp

# Repair if needed using QGIS:
# Vector → Geometry Tools → Check Validity
```

---

### Issue: CSV encoding errors

**Solution:**
```python
# Try different encodings
pd.read_csv('file.csv', encoding='utf-8')
pd.read_csv('file.csv', encoding='latin-1')
pd.read_csv('file.csv', encoding='cp1252')
```

---

### Issue: Out of memory loading large CSVs

**Solution:**
```python
# Load in chunks
for chunk in pd.read_csv('large_file.csv', chunksize=10000):
    process_chunk(chunk)
```
