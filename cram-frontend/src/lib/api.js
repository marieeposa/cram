import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fetch all pages and extract GeoJSON Features
const fetchAllPages = async (endpoint) => {
  let allFeatures = [];
  let nextUrl = `${endpoint}?format=json`;
  
  while (nextUrl) {
    try {
      const response = await axios.get(nextUrl);
      const data = response.data;
      
      if (data.results && data.results.type === 'FeatureCollection') {
        allFeatures = [...allFeatures, ...data.results.features];
        nextUrl = data.next;
      } else if (data.results && Array.isArray(data.results)) {
        allFeatures = [...allFeatures, ...data.results];
        nextUrl = data.next;
      } else if (Array.isArray(data)) {
        allFeatures = data;
        nextUrl = null;
      } else if (data.type === 'Feature') {
        allFeatures.push(data);
        nextUrl = null;
      } else {
        console.warn('Unexpected API format:', data);
        nextUrl = null;
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      break;
    }
  }
  
  return allFeatures;
};

// Barangay endpoints
export const fetchBarangays = async () => {
  try {
    const features = await fetchAllPages(`${API_BASE_URL}/barangays/`);
    console.log('Barangays loaded:', features.length);
    return features;
  } catch (error) {
    console.error('Error fetching barangays:', error);
    return [];
  }
};

export const fetchBarangayById = async (id) => {
  const response = await api.get(`/barangays/${id}/?format=json`);
  return response.data;
};

export const fetchBarangayAIAnalysis = async (id) => {
   const response = await api.get(`/barangays/${id}/ai_analysis/`);
  return response.data;
};

export const fetchHighRisk = async () => {
  const response = await api.get('/barangays/high_risk/?format=json');
  return response.data;
};

export const fetchStatistics = async () => {
  const response = await api.get('/barangays/statistics/?format=json');
  return response.data;
};

// Municipality endpoints
export const fetchMunicipalities = async () => {
  try {
    const results = await fetchAllPages(`${API_BASE_URL}/municipalities/`);
    return results;
  } catch (error) {
    console.error('Error fetching municipalities:', error);
    return [];
  }
};

export const fetchMunicipalityAIReport = async (id) => {
  const response = await api.get(`/municipalities/${id}/ai_report/`);
  return response.data;
};

// Air Quality endpoints
export const fetchAirQuality = async () => {
  const response = await api.get('/air-quality/latest/?format=json');
  return response.data;
};

export const fetchAirQualityAIAnalysis = async () => {
  const response = await api.get('/air-quality/ai_analysis/');
  return response.data;
};

// Hazard Layer endpoints
export const fetchNOAHFlood = async () => {
  try {
    const response = await api.get('/noah-flood/?format=json');
    if (response.data.results) {
      return response.data.results;
    }
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching NOAH flood:', error);
    return [];
  }
};

export const fetchStormSurge = async () => {
  try {
    const response = await api.get('/storm-surge/?format=json');
    if (response.data.results) {
      return response.data.results;
    }
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching storm surge:', error);
    return [];
  }
};

export const fetchLiquefaction = async () => {
  try {
    const response = await api.get('/liquefaction/?format=json');
    if (response.data.results) {
      return response.data.results;
    }
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching liquefaction:', error);
    return [];
  }
};

export const fetchLandslide = async () => {
  try {
    const response = await api.get('/hazards/?format=json&hazard_type=landslide');
    if (response.data.results) {
      return response.data.results;
    }
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching landslide:', error);
    return [];
  }
};

// Cyclone tracks
export const fetchCycloneTracks = async () => {
  const response = await api.get('/cyclone-tracks/affecting_negros/?format=json');
  return response.data;
};

export default api;