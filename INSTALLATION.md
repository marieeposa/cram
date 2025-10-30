# 🚀 CRAM Complete Installation Guide

**Step-by-step guide to install and run the Climate Resilience Action Matrix**

---

## 🌟 Overview

This guide will help you install the complete CRAM system on your local machine. You'll set up:

- ✅ **Backend**: Django API with PostgreSQL and PostGIS
- ✅ **Frontend**: Next.js web application
- ✅ **Data**: Climate and hazard data from Google Drive

**What you'll need:**
- Internet connection
- Administrator access to your computer
- Basic command line knowledge

---

## 💻 Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Python** | 3.10+ | Backend development |
| **Node.js** | 18+ | Frontend development |
| **PostgreSQL** | 14+ | Database |
| **PostGIS** | 3.3+ | Spatial database extension |
| **GDAL** | 3.4+ | Geospatial library |
| **Git** | Latest | Version control |

### System Requirements

**Minimum:**
- OS: Windows 10/11, macOS 10.15+, Ubuntu 20.04+
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB free

**Recommended:**
- OS: Windows 11 / macOS 13+ / Ubuntu 22.04 LTS
- CPU: 4+ cores
- RAM: 8GB+
- Storage: 30GB SSD

---

## ✅ Pre-Installation Checklist

Before starting, make sure you have:

- [ ] Administrator access to your computer
- [ ] Stable internet connection
- [ ] 20GB+ free disk space
- [ ] Text editor (VS Code, Sublime, Notepad++)
- [ ] Web browser (Chrome, Firefox, Edge)

---

## 🔧 Backend Installation

### Phase 1: Install Python

#### **Windows**

1. **Download Python**
   - Go to https://www.python.org/downloads/
   - Download Python 3.10 or higher

2. **Run Installer**
   - ✅ **IMPORTANT**: Check "Add Python to PATH"
   - Choose "Install Now"

3. **Verify Installation**
```powershell
   python --version
   pip --version
```

#### **macOS**
```bash
# Install using Homebrew
brew install python@3.11

# Verify
python3 --version
pip3 --version
```

#### **Linux (Ubuntu/Debian)**
```bash
# Update package list
sudo apt update

# Install Python
sudo apt install python3.11 python3.11-venv python3-pip python3-dev build-essential -y

# Verify
python3 --version
pip3 --version
```

---

### Phase 2: Install PostgreSQL

#### **Windows**

1. **Download PostgreSQL**
   - Visit https://www.postgresql.org/download/windows/
   - Download PostgreSQL 14 or higher

2. **Installation Options**
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4
   - ✅ Command Line Tools
   - Set password for `postgres` user: **Write this down!**
   - Port: 5432 (default)

3. **Install PostGIS**
   - During installation, Stack Builder should launch
   - Select "Spatial Extensions"
   - Choose "PostGIS 3.3 or higher"

4. **Verify**
```powershell
   psql --version
```

#### **macOS**
```bash
# Install PostgreSQL with PostGIS
brew install postgresql@14 postgis

# Start service
brew services start postgresql@14

# Verify
psql --version
```

#### **Linux (Ubuntu/Debian)**
```bash
# Install PostgreSQL and PostGIS
sudo apt install postgresql-14 postgresql-contrib-14 postgis postgresql-14-postgis-3 -y

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify
psql --version
```

---

### Phase 3: Install GDAL

#### **Windows - OSGeo4W (Recommended)**

1. **Download OSGeo4W**
   - Visit https://trac.osgeo.org/osgeo4w/
   - Download installer

2. **Run Installer**
   - Choose "Express Install"
   - Select "GDAL" package
   - Install to `C:\OSGeo4W64\`

3. **Add to PATH**
   - Right-click "This PC" → Properties
   - Advanced system settings → Environment Variables
   - Add to Path: `C:\OSGeo4W64\bin`

4. **Verify**
```powershell
   gdalinfo --version
```

#### **macOS**
```bash
brew install gdal
gdalinfo --version
```

#### **Linux**
```bash
sudo apt install gdal-bin libgdal-dev python3-gdal -y
gdalinfo --version
```

---

### Phase 4: Setup Backend

#### **Step 1: Clone Repository**
```bash
git clone https://github.com/marieeposa/cram.git
cd cram/cram-backend
```

#### **Step 2: Create Virtual Environment**
```bash
# Create venv
python -m venv venv

# Activate
# Windows:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate
```

#### **Step 3: Install Dependencies**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### **Step 4: Create Database**
```bash
# Connect to PostgreSQL
psql -U postgres
```
```sql
-- Create database
CREATE DATABASE cram_db;
\c cram_db
CREATE EXTENSION postgis;
SELECT PostGIS_version();
\q
```

#### **Step 5: Configure Environment**
```bash
cp .env.example .env
# Edit .env with your values
```

**.env content:**
```env
DB_NAME=cram_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

GROQ_API_KEY=your_groq_api_key
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Get Groq API Key:**
1. Visit https://console.groq.com
2. Sign up (free)
3. Get API key
4. Paste in .env

#### **Step 6: Run Migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

#### **Step 7: Create Superuser**
```bash
python manage.py createsuperuser
```

#### **Step 8: Start Server**
```bash
python manage.py runserver
```

**✅ Backend running at http://127.0.0.1:8000**

---

## ⚛️ Frontend Installation

**Open NEW terminal** (keep backend running)

### Phase 1: Install Node.js

#### **Windows**

1. Download from https://nodejs.org/
2. Install LTS version (18+)
3. Verify:
```powershell
   node --version
   npm --version
```

#### **macOS**
```bash
brew install node@18
node --version
```

#### **Linux**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
```

---

### Phase 2: Setup Frontend

#### **Step 1: Navigate to Frontend**
```bash
cd cram/cram-frontend
```

#### **Step 2: Install Dependencies**
```bash
npm install
```

#### **Step 3: Configure Environment**
```bash
cp .env.example .env.local
# Edit .env.local
```

**.env.local content:**
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_WEATHER_API_KEY=your_openweathermap_key
```

**Get Weather API Key:**
1. Visit https://openweathermap.org/api
2. Sign up (free)
3. Get API key
4. Paste in .env.local

#### **Step 4: Start Frontend**
```bash
npm run dev
```

**✅ Frontend running at http://localhost:3000**

---

## 📊 Data Setup

### Step 1: Download Data

1. Visit: https://drive.google.com/drive/folders/1axE500Yv-WhtxLzNXc8321WtM2GPSbaX
2. Download data files
3. Extract to Downloads

### Step 2: Copy to Backend
```bash
cd cram/cram-backend
mkdir -p data

# Windows:
xcopy /E /I "C:\Users\YourName\Downloads\data" "data"

# macOS/Linux:
cp -R ~/Downloads/data/* data/
```

### Step 3: Verify
```bash
ls -R data/
# Should show: shapefiles/, cchain/, census/, hazards/
```

---

## ✅ Verification

### Test Backend

1. **API Root**: http://127.0.0.1:8000/api/
   - Should show endpoint list ✅

2. **Admin**: http://127.0.0.1:8000/admin/
   - Login with superuser ✅

3. **Barangays**: http://127.0.0.1:8000/api/barangays/
   - Should return JSON ✅

### Test Frontend

1. **Home**: http://localhost:3000
   - Dashboard loads ✅

2. **Map**: http://localhost:3000/map
   - Map page loads ✅

3. **Console**: Press F12
   - No CORS errors ✅

---

## 🐛 Common Issues

### Backend Won't Start

**Issue:** `ModuleNotFoundError: No module named 'psycopg2'`

**Solution:**
```bash
source venv/bin/activate
pip install psycopg2-binary
```

---

**Issue:** `connection to server failed`

**Solution:**
1. Check PostgreSQL is running
2. Verify password in .env
3. Test: `psql -U postgres -d cram_db`

---

**Issue:** `Could not find GDAL library`

**Windows Solution:**
```env
# Add to .env:
GDAL_LIBRARY_PATH=C:\OSGeo4W64\bin\gdal304.dll
GEOS_LIBRARY_PATH=C:\OSGeo4W64\bin\geos_c.dll
```

---

### Frontend Won't Start

**Issue:** `Module not found`

**Solution:**
```bash
rm -rf node_modules .next
npm install
```

---

**Issue:** `Port 3000 in use`

**Solution:**
```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Or use different port:
PORT=3001 npm run dev
```

---

**Issue:** `CORS blocked`

**Solution:**
1. Check backend .env has:
```env
   CORS_ALLOWED_ORIGINS=http://localhost:3000
```
2. Restart backend

---

### Map Not Displaying

**Solution:**
```jsx
// Ensure Map uses dynamic import
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false  // Required for Leaflet
});
```

---

## 🎯 Next Steps

### 1. Explore Application

- Visit admin: http://127.0.0.1:8000/admin/
- Add test data manually
- Navigate all frontend pages

### 2. Import Data
```bash
# From Google Drive
python manage.py import_shapefiles --type=barangays --file=data/shapefiles/barangays/NegrosOriental_Barangays.shp
```

### 3. Configure API Keys

- Groq: https://console.groq.com
- Weather: https://openweathermap.org/api

### 4. Daily Workflow
```bash
# Start backend
cd cram-backend
source venv/bin/activate
python manage.py runserver

# Start frontend (new terminal)
cd cram-frontend
npm run dev
```

### 5. Testing
```bash
# Backend
python manage.py test

# Frontend
npm test
```

### 6. Build for Production
```bash
# Backend
DEBUG=False
python manage.py collectstatic
gunicorn cram.wsgi:application

# Frontend
npm run build
npm start
```

---

## 🎉 Congratulations!

You now have:
- ✅ Django backend at http://127.0.0.1:8000
- ✅ Next.js frontend at http://localhost:3000
- ✅ PostgreSQL with PostGIS
- ✅ Complete dev environment

---

## 📝 Installation Summary
```
[✓] Python 3.10+
[✓] Node.js 18+
[✓] PostgreSQL 14+ with PostGIS
[✓] GDAL 3.4+
[✓] Virtual environment
[✓] Dependencies installed
[✓] Database created
[✓] Environment configured
[✓] Migrations applied
[✓] Superuser created
[✓] Both servers running
[✓] Installation verified
```

**Status:** ✅ **COMPLETE**

---

## 🔄 Updating CRAM
```bash
git pull origin main

# Backend
cd cram-backend
pip install -r requirements.txt
python manage.py migrate

# Frontend
cd cram-frontend
npm install
```

---

## 💾 Backup
```bash
# Database
pg_dump -U postgres cram_db > backup.sql

# Environment files
cp cram-backend/.env cram-backend/.env.backup
cp cram-frontend/.env.local cram-frontend/.env.local.backup
```

---

## 🔐 Security Notes

For production:
- ⚠️ Set DEBUG=False
- ⚠️ Use strong SECRET_KEY
- ⚠️ Use strong passwords
- ⚠️ Enable HTTPS
- ⚠️ Restrict ALLOWED_HOSTS

---

## 📊 System Check
```bash
# Backend
curl http://127.0.0.1:8000/api/

# Frontend
curl http://localhost:3000
```

---

## 🌟 Success Checklist

- [x] Backend starts without errors
- [x] Frontend starts without errors
- [x] Can access admin panel
- [x] Can access dashboard
- [x] No CORS errors
- [x] API calls work
- [x] Database connected
- [x] PostGIS enabled

**If all checked: 🎉 Installation successful!**

---

**Thank you for installing CRAM!**

**Built with ❤️ for climate-resilient communities**
