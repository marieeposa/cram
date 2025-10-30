'use client';
import { useEffect, useState } from 'react';
import { getWeatherData, getWeatherForecast, getWeatherAlerts, getWeatherIcon } from '@/lib/weather';
import { Cloud, Droplets, Wind, Eye, Gauge, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';

export default function WeatherPage() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        const [currentWeather, forecastData, weatherAlerts] = await Promise.all([
          getWeatherData(),
          getWeatherForecast(),
          getWeatherAlerts()
        ]);
        
        setWeather(currentWeather);
        setForecast(forecastData);
        setAlerts(weatherAlerts);
      } catch (error) {
        console.error('Failed to load weather:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWeatherData();
    
    // Refresh every 10 minutes
    const interval = setInterval(loadWeatherData, 600000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-xl text-gray-600">Loading weather data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Weather Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            🌤️ Real-time Weather for Negros Oriental
          </p>
        </div>

        {/* Weather Alerts */}
        {alerts.length > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-600" size={32} />
              <h2 className="text-2xl font-bold text-red-900">Active Weather Alerts</h2>
            </div>
            {alerts.map((alert, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 mb-3">
                <h3 className="font-bold text-red-900">{alert.event}</h3>
                <p className="text-sm text-gray-700 mt-2">{alert.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Current Weather */}
        {weather && (
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-8 mb-6 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Current Weather</h2>
                <p className="text-lg opacity-90">{weather.name}</p>
              </div>
              <img 
                src={getWeatherIcon(weather.weather[0].icon)} 
                alt={weather.weather[0].description}
                className="w-24 h-24"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <Cloud size={24} className="mb-2" />
                <div className="text-4xl font-bold">{Math.round(weather.main.temp)}°C</div>
                <div className="text-sm opacity-90">Temperature</div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <Droplets size={24} className="mb-2" />
                <div className="text-4xl font-bold">{weather.main.humidity}%</div>
                <div className="text-sm opacity-90">Humidity</div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <Wind size={24} className="mb-2" />
                <div className="text-4xl font-bold">{Math.round(weather.wind.speed)} m/s</div>
                <div className="text-sm opacity-90">Wind Speed</div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <Gauge size={24} className="mb-2" />
                <div className="text-4xl font-bold">{weather.main.pressure}</div>
                <div className="text-sm opacity-90">Pressure (hPa)</div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-lg capitalize">{weather.weather[0].description}</div>
              <div className="text-sm opacity-90">
                Feels like: {Math.round(weather.main.feels_like)}°C
              </div>
            </div>
          </div>
        )}

        {/* 5-Day Forecast */}
        {forecast && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="text-indigo-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900">5-Day Forecast</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {forecast.list
                .filter((item, idx) => idx % 8 === 0)
                .slice(0, 5)
                .map((item, idx) => (
                  <div 
                    key={idx}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center hover:shadow-lg transition-all"
                  >
                    <div className="font-semibold text-gray-900 mb-2">
                      {new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <img 
                      src={getWeatherIcon(item.weather[0].icon)}
                      alt={item.weather[0].description}
                      className="w-16 h-16 mx-auto"
                    />
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {Math.round(item.main.temp)}°C
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {item.weather[0].description}
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-600">
                      <Droplets size={14} />
                      {item.main.humidity}%
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Climate Risk Correlation */}
        <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-orange-600" size={28} />
            <h2 className="text-2xl font-bold text-gray-900">Climate Risk Correlation</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <h3 className="font-bold text-yellow-900 mb-2">🌊 High Rainfall</h3>
              <p className="text-sm text-gray-700">
                Increased flood risk in low-lying coastal barangays. Monitor storm surge alerts.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-bold text-blue-900 mb-2">💨 Strong Winds</h3>
              <p className="text-sm text-gray-700">
                Potential landslide triggers in mountainous areas. Check hazard-prone zones.
              </p>
            </div>
            
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <h3 className="font-bold text-red-900 mb-2">🌡️ High Temperature</h3>
              <p className="text-sm text-gray-700">
                Heat stress risk. Vulnerable populations in barangays with poor health infrastructure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}