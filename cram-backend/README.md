# 🔧 CRAM Backend - Django API

Django-based REST API for the Climate Resilience Action Matrix

---

## 🌟 Overview

The CRAM Backend is a Django REST API that provides:
- **516 Barangay Profiles** with climate risk assessment
- **BRRS Calculation Engine** for resilience scoring
- **PostGIS Integration** for geospatial queries
- **AI Analysis** using LLaMA 3.3 70B via Groq API
- **RESTful API** with JSON and GeoJSON support

---

## ✨ Features

### Core Functionality
- ✅ RESTful API with Django REST Framework
- ✅ PostgreSQL database with PostGIS extension
- ✅ Geospatial queries and operations
- ✅ BRRS (Barangay Risk and Resilience Score) calculation
- ✅ AI-powered recommendations via Groq API
- ✅ Real-time data processing
- ✅ GeoJSON export support

### API Capabilities
- 📊 Barangay statistics and profiles
- 🗺️ Geospatial data with PostGIS
- 🏛️ Municipality aggregations
- ⚠️ Hazard data (flood, landslide, liquefaction, storm surge)
- 🌤️ Air quality analysis
- 🤖 AI-generated insights

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Programming language |
| Django | 4.2 | Web framework |
| Django REST Framework | 3.14 | API framework |
| PostgreSQL | 14+ | Database |
| PostGIS | 3.3+ | Spatial database |
| GDAL | 3.4+ | Geospatial library |
| Groq API | - | AI integration |

---

## 🚀 Installation

### Prerequisites

- Python 3.10+
- PostgreSQL 14+ with PostGIS 3.3+
- GDAL 3.4+

### Quick Start
```bash
# Clone repository
git clone https://github.com/marieeposa/cram.git
cd cram/cram-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create database
psql -U postgres -c "CREATE DATABASE cram_db;"
psql -U postgres -d cram_db -c "CREATE EXTENSION postgis;"

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file:
```env
# Database
DB_NAME=cram_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Groq API
GROQ_API_KEY=your_groq_api_key

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# GDAL (Windows only)
# GDAL_LIBRARY_PATH=C:\OSGeo4W64\bin\gdal304.dll
# GEOS_LIBRARY_PATH=C:\OSGeo4W64\bin\geos_c.dll
```

### Get API Keys

**Groq API:**
1. Visit https://console.groq.com
2. Sign up for free account
3. Create API key
4. Add to .env

---

## 📡 API Endpoints

### Base URL
```
http://127.0.0.1:8000/api
```

### Barangays

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/barangays/` | GET | List all barangays |
| `/barangays/{id}/` | GET | Get barangay details |
| `/barangays/statistics/` | GET | System statistics |
| `/barangays/high-risk/` | GET | High-risk barangays |
| `/barangays/{id}/ai_analysis/` | GET | AI recommendations |

**Query Parameters:**
- `page` - Page number
- `page_size` - Items per page (max 100)
- `search` - Search by name
- `municipality` - Filter by municipality
- `risk_level` - Filter by risk (low/medium/high)
- `ordering` - Sort field (e.g., `-resilience_score`)
- `format` - Response format (json/geojson)

**Example Request:**
```bash
curl http://127.0.0.1:8000/api/barangays/?municipality=Dumaguete&risk_level=high
```

**Example Response:**
```json
{
  "count": 516,
  "next": "http://127.0.0.1:8000/api/barangays/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Poblacion 1",
      "municipality": "Dumaguete City",
      "province": "Negros Oriental",
      "population": 5234,
      "resilience_score": 42.5,
      "risk_level": "medium",
      "resilience": {
        "hazard_exposure_score": 45.2,
        "health_sensitivity_score": 38.7,
        "adaptive_capacity_score": 43.1
      },
      "hazards": [
        {
          "hazard_type": "flood",
          "susceptibility": "high"
        }
      ]
    }
  ]
}
```

---

### Municipalities

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/municipalities/` | GET | List municipalities |
| `/municipalities/{id}/` | GET | Municipality details |
| `/municipalities/{id}/ai_report/` | GET | AI strategic report |

---

### Hazards

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/hazards/` | GET | All hazard data |
| `/noah-flood/` | GET | NOAH flood data |
| `/storm-surge/` | GET | Storm surge data |
| `/liquefaction/` | GET | Liquefaction data |

---

### Air Quality

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/air-quality/` | GET | Current air quality |
| `/air-quality/ai_analysis/` | GET | AI analysis |

---

## 🗄️ Database Models

### Barangay Model
```python
class Barangay(models.Model):
    name = models.CharField(max_length=255)
    municipality = models.CharField(max_length=255)
    province = models.CharField(max_length=255)
    population = models.IntegerField()
    households = models.IntegerField()
    total_area = models.FloatField()
    is_coastal = models.BooleanField()
    geometry = models.MultiPolygonField(srid=4326)
    resilience_score = models.FloatField()
    risk_level = models.CharField(max_length=20)
```

### Hazard Model
```python
class Hazard(models.Model):
    barangay = models.ForeignKey(Barangay, on_delete=models.CASCADE)
    hazard_type = models.CharField(max_length=50)
    susceptibility = models.CharField(max_length=20)
    susceptibility_score = models.FloatField()
```

---

## 🏃 Running the Server

### Development Server
```bash
# Activate virtual environment
source venv/bin/activate  # Windows: venv\Scripts\activate

# Run server
python manage.py runserver

# Server starts at http://127.0.0.1:8000
```

### Run on Different Port
```bash
python manage.py runserver 8001
```

### Production Server
```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn cram.wsgi:application --bind 0.0.0.0:8000
```

---

## 🧪 Testing

### Run Tests
```bash
# Run all tests
python manage.py test

# Run specific test file
python manage.py test cram.tests.test_models

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

---

## 🐛 Troubleshooting

### Issue: ModuleNotFoundError
```bash
# Ensure virtual environment is active
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

---

### Issue: Database Connection Error
```bash
# Check PostgreSQL is running
# Windows: Check Services
# macOS: brew services list
# Linux: sudo systemctl status postgresql

# Test connection
psql -U postgres -d cram_db
```

---

### Issue: GDAL Not Found

**Windows:**
```env
# Add to .env
GDAL_LIBRARY_PATH=C:\OSGeo4W64\bin\gdal304.dll
GEOS_LIBRARY_PATH=C:\OSGeo4W64\bin\geos_c.dll
```

**macOS:**
```bash
brew install gdal
```

**Linux:**
```bash
sudo apt install gdal-bin libgdal-dev python3-gdal
```

---

### Issue: PostGIS Extension Not Found
```sql
-- Connect to database
psql -U postgres -d cram_db

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify
SELECT PostGIS_version();
```

---

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [GeoDjango](https://docs.djangoproject.com/en/4.2/ref/contrib/gis/)
- [PostGIS](https://postgis.net/documentation/)

---

## 📞 Support

- **Main Documentation**: [../README.md](../README.md)
- **Installation Guide**: [../INSTALLATION.md](../INSTALLATION.md)
