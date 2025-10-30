# ⚛️ CRAM Frontend - Next.js Application

Next.js-based web application for the Climate Resilience Action Matrix

---

## 🌟 Overview

The CRAM Frontend is a Next.js 16 application that provides:
- **Interactive Dashboard** with real-time climate data
- **Risk Map** using Leaflet for 516 barangays
- **Barangay Profiles** with AI recommendations
- **Weather Dashboard** with forecasts
- **Support Network** for inter-barangay coordination
- **Mobile-Responsive** design

---

## ✨ Features

### User Interface
- ✅ Interactive dashboard with real-time stats
- ✅ Leaflet map with 516 barangay polygons
- ✅ Color-coded risk visualization
- ✅ AI-powered recommendations
- ✅ PDF export functionality
- ✅ Weather integration
- ✅ Alert notification system

### Technical Features
- ⚡ Next.js 16 App Router
- 🎨 Tailwind CSS styling
- 🗺️ Leaflet maps with PostGIS data
- 📊 Recharts visualizations
- 🔄 Real-time data polling (30s)
- 📱 Mobile responsive design

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16 | React framework |
| React | 19 | UI library |
| Tailwind CSS | 3.x | Styling |
| Leaflet | 1.9 | Interactive maps |
| Recharts | 2.x | Charts |
| Axios | 1.x | HTTP client |
| Lucide React | - | Icons |
| jsPDF | - | PDF generation |

---

## 🚀 Installation

### Prerequisites

- Node.js 18+
- npm 9+

### Quick Start
```bash
# Clone repository
git clone https://github.com/marieeposa/cram.git
cd cram/cram-frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your settings

# Start development server
npm run dev

# Open http://localhost:3000
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env.local` file:
```env
# Backend API
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# OpenWeatherMap API
NEXT_PUBLIC_WEATHER_API_KEY=your_openweathermap_key
```

### Get API Keys

**OpenWeatherMap:**
1. Visit https://openweathermap.org/api
2. Sign up for free account
3. Get API key
4. Add to .env.local

**Free tier includes:**
- 60 calls/minute
- 1,000,000 calls/month
- 5-day forecast

---

## 📁 Project Structure
```
cram-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.js            # Dashboard
│   │   ├── layout.js          # Root layout
│   │   ├── globals.css        # Global styles
│   │   ├── map/               # Map page
│   │   ├── barangays/         # Barangay pages
│   │   ├── municipalities/    # Municipality pages
│   │   ├── support/           # Support network
│   │   ├── weather/           # Weather dashboard
│   │   └── air-quality/       # Air quality page
│   │
│   ├── components/            # Reusable components
│   │   ├── Navbar.js         # Navigation
│   │   ├── Map.js            # Leaflet map
│   │   ├── StatsCard.js      # Statistics cards
│   │   ├── RiskBadge.js      # Risk indicators
│   │   ├── AlertSystem.js    # Alerts
│   │   └── PDFExport.js      # PDF generation
│   │
│   ├── lib/                   # Utilities
│   │   ├── api.js            # API client
│   │   ├── weather.js        # Weather API
│   │   └── glossary.js       # Terminology
│   │
│   └── hooks/                 # Custom hooks
│       └── useRealTimeData.js # Real-time polling
│
├── public/                    # Static assets
├── .env.example              # Environment template
├── .env.local                # Your environment
├── next.config.mjs           # Next.js config
├── tailwind.config.js        # Tailwind config
└── package.json              # Dependencies
```

---

## 🧩 Key Components

### Navbar Component
```jsx
import Navbar from '@/components/Navbar';

<Navbar />
```

Navigation bar with links to all major pages.

---

### Map Component
```jsx
import Map from '@/components/Map';

<Map 
  barangays={barangayData}
  center={[9.3, 123.3]}
  zoom={9}
/>
```

Interactive Leaflet map with color-coded barangay polygons.

---

### Real-Time Data Hook
```jsx
import { useRealTimeData } from '@/hooks/useRealTimeData';

const { data, lastUpdate } = useRealTimeData(
  'http://127.0.0.1:8000/api/barangays/statistics/',
  30000 // 30 seconds
);
```

Automatically polls API every 30 seconds.

---

### PDF Export
```jsx
import { exportToPDF } from '@/components/PDFExport';

<button onClick={() => exportToPDF(barangayData)}>
  Export PDF
</button>
```

Generates PDF reports of barangay profiles.

---

## 🏃 Running the Application

### Development Mode
```bash
# Start development server
npm run dev

# Server starts at http://localhost:3000
# Hot reload enabled
```

### Production Build
```bash
# Create optimized build
npm run build

# Start production server
npm start
```

### Run on Different Port
```bash
PORT=3001 npm run dev
```

---

## 🎨 Styling

### Tailwind CSS

The project uses Tailwind CSS for styling.

**Common patterns:**
```jsx
// Card
<div className="bg-white rounded-2xl shadow-xl p-6">

// Button
<button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
```

---

## 📦 Building for Production

### Create Build
```bash
npm run build
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Deploy to Netlify

**Build settings:**
- Build command: `npm run build`
- Publish directory: `.next`

---

## 🐛 Troubleshooting

### Issue: Module Not Found
```bash
rm -rf node_modules .next
npm install
```

---

### Issue: Port Already in Use
```bash
# Kill process
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Or use different port:
PORT=3001 npm run dev
```

---

### Issue: Map Not Loading

Ensure dynamic import with `ssr: false`:
```jsx
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,  // Required for Leaflet
  loading: () => <p>Loading map...</p>
});
```

---

### Issue: API Connection Failed

1. Verify backend is running at http://127.0.0.1:8000
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check CORS settings in backend

---

### Issue: Build Fails
```bash
# Clear cache
rm -rf .next

# Rebuild
npm run build
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Leaflet](https://leafletjs.com/reference.html)
- [Recharts](https://recharts.org/)

---

## 📞 Support

- **Main Documentation**: [../README.md](../README.md)
- **Installation Guide**: [../INSTALLATION.md](../INSTALLATION.md)
