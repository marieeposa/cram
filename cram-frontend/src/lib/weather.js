import axios from 'axios';

// OpenWeatherMap API (FREE - Sign up at openweathermap.org)
const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || 'YOUR_API_KEY_HERE';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Negros Oriental coordinates
const NEGROS_ORIENTAL_COORDS = {
  lat: 9.3167,
  lon: 123.3000
};

export const getWeatherData = async () => {
  try {
    const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
      params: {
        lat: NEGROS_ORIENTAL_COORDS.lat,
        lon: NEGROS_ORIENTAL_COORDS.lon,
        appid: WEATHER_API_KEY,
        units: 'metric'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Weather API error:', error);
    throw error;
  }
};

export const getWeatherForecast = async () => {
  try {
    const response = await axios.get(`${WEATHER_BASE_URL}/forecast`, {
      params: {
        lat: NEGROS_ORIENTAL_COORDS.lat,
        lon: NEGROS_ORIENTAL_COORDS.lon,
        appid: WEATHER_API_KEY,
        units: 'metric'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Forecast API error:', error);
    throw error;
  }
};

export const getWeatherAlerts = async () => {
  try {
    const response = await axios.get(`${WEATHER_BASE_URL}/onecall`, {
      params: {
        lat: NEGROS_ORIENTAL_COORDS.lat,
        lon: NEGROS_ORIENTAL_COORDS.lon,
        appid: WEATHER_API_KEY,
        units: 'metric',
        exclude: 'minutely,hourly'
      }
    });
    return response.data.alerts || [];
  } catch (error) {
    console.error('Weather alerts error:', error);
    return [];
  }
};

export const getWeatherIcon = (iconCode) => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};