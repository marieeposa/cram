# 🌍 CRAM - Climate Resilience Action Matrix

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)

**AI-Powered Climate Risk Assessment Platform for Negros Oriental, Philippines**

> Protecting 1.5M+ residents across 516 barangays through data-driven climate resilience planning

---

## 🌟 Overview

**CRAM (Climate Resilience Action Matrix)** is a comprehensive platform designed to assess, monitor, and improve climate resilience across 516 barangays in Negros Oriental, Philippines. The system integrates multi-source hazard data, demographic information, and AI-powered analysis to provide actionable insights for disaster risk reduction and management.

### 📊 Impact Metrics

| Metric | Value |
|--------|-------|
| **Barangays Covered** | 516 |
| **Population Protected** | 1.5M+ residents |
| **Municipalities** | 30+ |
| **Hazard Types** | Flood, Landslide, Liquefaction, Storm Surge |
| **AI Model** | LLaMA 3.3 70B via Groq API |
| **Data Refresh** | Real-time (30 seconds) |

---

## 🚨 Problem Statement

### Climate Challenges in Negros Oriental

**Geographic Vulnerabilities:**
- 🌊 **24 coastal barangays** exposed to storm surge and sea-level rise
- ⛰️ **Mountainous terrain** prone to landslides during typhoons
- 💧 **Low-lying areas** susceptible to severe flooding
- 📍 **Seismic activity** with liquefaction potential

**Data Fragmentation:**
- Hazard data scattered across multiple government agencies (NOAH, PAGASA, MGB, PHIVOLCS)
- No unified risk assessment methodology for comparing barangays
- Limited accessibility of climate data for local decision-makers
- Delayed emergency response due to information gaps

**Resource Constraints:**
- Limited disaster response capacity at barangay level
- Unequal distribution of resources across municipalities
- Lack of coordination mechanisms during emergencies
- Insufficient tools for evidence-based disaster planning

---

## 💡 Solution

CRAM provides a unified platform that:

### 1. **Unified Risk Assessment (BRRS)**
**Barangay Risk and Resilience Score** - A composite metric combining:
- **Hazard Exposure (40%)**: Flood, landslide, liquefaction, storm surge
- **Health Sensitivity (30%)**: Population density, health infrastructure
- **Adaptive Capacity (30%)**: Resources, governance, infrastructure

**Formula:**

BRRS = (Hazard_Exposure × 0.40) + (Health_Sensitivity × 0.30) + (Adaptive_Capacity × 0.30)

**Risk Classification:**
- 🟢 **Low Risk**: BRRS < 30
- 🟡 **Medium Risk**: 30 ≤ BRRS < 50
- 🔴 **High Risk**: BRRS ≥ 50

### 2. **Geospatial Intelligence**
- Interactive Leaflet maps with color-coded risk levels
- 516 barangay polygons with accurate boundaries
- Multi-layer hazard visualization
- Click-to-explore detailed information

### 3. **AI-Powered Insights**
- LLaMA 3.3 70B integration via Groq API
- Customized recommendations for each barangay
- Municipal-level strategic reports
- Air quality analysis
- Natural language explanations

### 4. **Real-Time Monitoring**
- 30-second data refresh cycles
- Live status indicators
- Automated alert generation
- Weather integration (OpenWeatherMap)

### 5. **Collaborative Tools**
- **Support Network**: Inter-barangay resource request and matching system
- **Alert System**: Automated notifications for critical situations
- **Contact Directory**: Verified officials for emergency coordination

---

## ✨ Key Features

### 📊 **Dashboard**
- Real-time statistics for all 516 barangays
- Top 5 high-risk barangays highlighted
- AI-powered air quality analysis
- Hazard data coverage visualization
- Live data indicator (30-second refresh)
- Advanced data visualizations

### 🗺️ **Interactive Risk Map**
- Color-coded BRRS visualization (Green/Yellow/Red)
- Click-to-explore barangay details
- Responsive popups with key metrics
- Accurate geospatial boundaries
- Legend and statistics panel

### 🏘️ **Barangay Profiles**
- Demographics (population, households, land area)
- BRRS breakdown (hazard, health, adaptive)
- Identified hazards with susceptibility levels
- AI-generated recommendations
- PDF export functionality
- Official contact information

### 🏛️ **Municipality Analytics**
- Aggregated statistics across barangays
- Risk distribution charts (bar, pie, radar)
- Top 10 highest-risk barangays
- AI-generated strategic reports
- Comparative analysis tools

### 🤝 **Support Network**
- Resource request submission form
- Active request visibility
- Contact information (phone, email)
- Urgency classification (critical/high/medium/low)
- Resource type categorization
- Request resolution tracking

### 🌤️ **Weather Dashboard**
- Real-time weather conditions
- 5-day forecast with icons
- Temperature, humidity, wind, pressure
- Weather alert integration
- Climate risk correlation

### 🔔 **Alert System**
- Floating notification bell
- Critical risk alerts (BRRS ≥ 70)
- High risk warnings (BRRS ≥ 50)
- Coastal risk notifications
- Dismissible alerts with timestamps

### 📈 **Advanced Visualizations**
- Risk distribution by municipality
- BRRS score distribution
- Coastal vs inland comparison
- Top 10 highest risk barangays
- Interactive charts using Recharts

---

## 🛠️ Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.10+ | Core programming language |
| **Django** | 4.2 | Web framework |
| **PostgreSQL** | 14+ | Relational database |
| **PostGIS** | 3.3+ | Spatial database extension |
| **Django REST Framework** | 3.14 | RESTful API |
| **GeoDjango** | - | Geospatial operations |
| **GDAL** | 3.4+ | Geospatial library |
| **Groq API** | - | AI analysis (LLaMA 3.3 70B) |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Next.js** | 16 | React framework |
| **React** | 19 | UI library |
| **Tailwind CSS** | 3.x | Styling |
| **Leaflet** | 1.9 | Interactive maps |
| **Recharts** | 2.x | Data visualization |
| **Axios** | 1.x | HTTP client |
| **Lucide React** | - | Icons |
| **jsPDF** | - | PDF generation |

### External APIs
- **Groq API**: AI analysis using LLaMA 3.3 70B
- **OpenWeatherMap**: Real-time weather data

---

## 🏗️ System Architecture

┌─────────────────────────────────────────────────────────┐
│              PRESENTATION LAYER (Frontend)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │Dashboard │  │   Maps   │  │ Barangay │  │Municipal││
│  │          │  │          │  │ Profiles │  │ Reports ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
│          Next.js 16 + React 19 + Tailwind CSS           │
└────────────────────────┬────────────────────────────────┘
│ REST API (JSON/GeoJSON)
┌────────────────────────▼────────────────────────────────┐
│            APPLICATION LAYER (Backend)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Django REST  │  │  AI Engine   │  │  Weather     │ │
│  │  Framework   │  │ (Groq/LLaMA) │  │  Integration │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│        Django 4.2 + Python 3.10 + GeoDjango             │
└────────────────────────┬────────────────────────────────┘
│
┌────────────────────────▼────────────────────────────────┐
│                DATA LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ PostgreSQL   │  │   PostGIS    │  │  Shapefiles  │ │
│  │  Database    │  │  Geospatial  │  │   (Google    │ │
│  │              │  │   Queries    │  │    Drive)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│            516 Barangays + Hazard Data                   │
└─────────────────────────────────────────────────────────┘

### Data Flow

1. **Data Ingestion**: Shapefiles (Google Drive) → PostGIS → Django Models
2. **Processing**: Raw Data → BRRS Calculation → Risk Classification
3. **API Layer**: Django REST Framework → JSON/GeoJSON → Frontend
4. **Visualization**: React Components → Leaflet Maps → User Interface
5. **AI Analysis**: User Request → Groq API → LLaMA 3.3 → Recommendations
6. **Real-Time Updates**: Polling (30s) → API Fetch → State Update → UI Refresh

---

## 🚀 Installation

### Quick Start

```bash
# Clone repository
git clone https://github.com/marieeposa/cram.git
cd cram

# Follow detailed installation guide
See INSTALLATION.md for complete step-by-step instructions

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+ with PostGIS 3.3+
- GDAL 3.4+
- Git

### Installation Guides

- 📖 [Complete Installation Guide](INSTALLATION.md)
- 📖 [Backend Setup](cram-backend/README.md)
- 📖 [Frontend Setup](cram-frontend/README.md)
- 📖 [Data Setup](DATA.md)

-----

## 📖 Usage

### For Barangay Officials

1. *View Risk Score*: Navigate to Barangays → Search your barangay
1. *Get Recommendations*: Click barangay → View AI recommendations
1. *Request Support*: Go to Support Network → Submit request
1. *Export Report*: View barangay profile → Export PDF

### For Municipal Planners

1. *View Overview*: Select municipality from dropdown
1. *Analyze Trends*: Review charts and statistics
1. *Generate Report*: Click “AI Strategic Report”
1. *Coordinate Resources*: Check Support Network for requests

### For Researchers

Access data via API:

# Get all barangays
curl http://127.0.0.1:8000/api/barangays/

# Get GeoJSON format
curl http://127.0.0.1:8000/api/barangays/?format=geojson

-----

## 📡 API Documentation

### Base URL

http://127.0.0.1:8000/api

### Key Endpoints

*Barangays*

- GET /barangays/ - List all barangays
- GET /barangays/{id}/ - Get barangay details
- GET /barangays/statistics/ - System statistics
- GET /barangays/high-risk/ - High-risk barangays

*Municipalities*

- GET /municipalities/ - List municipalities
- GET /municipalities/{id}/ - Municipality details

*Hazards*

- GET /noah-flood/ - NOAH flood data
- GET /storm-surge/ - Storm surge data
- GET /liquefaction/ - Liquefaction data

-----

## 📊 Data Sources

### Government Data

*NOAH (Nationwide Operational Assessment of Hazards)*

- Source: DOST-PHIVOLCS
- Data: Flood and landslide hazard maps
- Format: Shapefiles
- Coverage: All 516 barangays

*Philippine Statistics Authority (PSA)*

- Source: 2020 Census
- Data: Demographics, households
- Format: CSV
- Granularity: Barangay-level
*Data Repository:**
📥 <https://drive.google.com/drive/folders/1axE500Yv-WhtxLzNXc8321WtM2GPSbaX>

See <DATA.md> for complete data documentation.

-----

*Partners:*

- Negros Oriental Provincial Government
- Provincial DRRMO
- DOST - Project NOAH
- Philippine Statistics Authority

-----

## 🙏 Acknowledgments

Special thanks to:

- Government agencies for hazard data
- Groq for AI platform access
- OpenWeatherMap for weather data
- Open source community
- Local communities in Negros Oriental

-----

## 📈 Statistics

- *Lines of Code*: 15,000+
- *Barangays*: 516
- *Population*: 1.5M+
- *API Endpoints*: 15+
-*Contributors**: 10+


*Built with ❤️ for climate-resilient communities in Negros Oriental*

Protecting lives through data-driven climate resilience
