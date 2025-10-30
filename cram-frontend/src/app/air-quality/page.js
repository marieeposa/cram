'use client';
import { useEffect, useState } from 'react';
import { fetchAirQuality, fetchAirQualityAIAnalysis } from '@/lib/api';
import InfoTooltip from '@/components/InfoTooltip';
import { GLOSSARY } from '@/lib/glossary';
import { Wind, Brain, Loader2, TrendingUp } from 'lucide-react';

export default function AirQualityPage() {
  const [airQuality, setAirQuality] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const aqData = await fetchAirQuality();
        setAirQuality(aqData);

        setAiLoading(true);
        try {
          const aiData = await fetchAirQualityAIAnalysis();
          setAiAnalysis(aiData);
        } catch (aiError) {
          console.error('AI analysis failed:', aiError);
        } finally {
          setAiLoading(false);
        }
      } catch (error) {
        console.error('Error loading air quality:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-xl text-gray-600">Loading air quality data...</div>
        </div>
      </div>
    );
  }

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return 'from-green-500 to-emerald-500';
    if (aqi <= 100) return 'from-yellow-500 to-orange-500';
    if (aqi <= 150) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-purple-500';
  };

  const getAQILabel = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    return 'Very Unhealthy';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Air Quality Monitoring
          </h1>
          <div className="text-gray-600 text-lg flex items-center justify-center gap-2">
            <Wind size={20} className="text-cyan-600" />
            Real-time Air Quality Index Across Negros Oriental
            <InfoTooltip {...GLOSSARY.airQuality} />
          </div>
        </div>

        {/* AI Analysis */}
        {aiAnalysis && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 mb-8 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="text-purple-600 animate-pulse" size={32} />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Regional Analysis</h2>
                <p className="text-sm text-purple-600">Powered by Llama 3.1 70B • Period: {aiAnalysis.period}</p>
              </div>
            </div>
            
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-purple-600 mr-3" size={24} />
                <span className="text-gray-600">Analyzing air quality trends...</span>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 whitespace-pre-wrap text-gray-800 leading-relaxed">
                {aiAnalysis.analysis}
              </div>
            )}
          </div>
        )}

        {/* AQI Reference Guide */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-600" />
            AQI Reference Guide
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { range: '0-50', label: 'Good', color: 'bg-green-500' },
              { range: '51-100', label: 'Moderate', color: 'bg-yellow-500' },
              { range: '101-150', label: 'Unhealthy for Sensitive', color: 'bg-orange-500' },
              { range: '151-200', label: 'Unhealthy', color: 'bg-red-500' },
              { range: '201+', label: 'Very Unhealthy', color: 'bg-purple-500' },
            ].map((item) => (
              <div key={item.range} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`w-full h-2 ${item.color} rounded mb-2`}></div>
                <div className="font-bold text-sm">{item.range}</div>
                <div className="text-xs text-gray-600">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Air Quality Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {airQuality.map((aq) => {
            const aqi = aq.avg_aqi || 0;
            return (
              <div key={aq.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
                {/* Header */}
                <div className={`bg-gradient-to-r ${getAQIColor(aqi)} p-6 text-white`}>
                  <h3 className="text-2xl font-bold mb-2">{aq.municipality_name}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-bold">{aqi.toFixed(1)}</div>
                      <div className="text-sm opacity-90">Air Quality Index</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{getAQILabel(aqi)}</div>
                      <div className="text-xs opacity-90">Status</div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{aq.avg_pm25?.toFixed(1) || 'N/A'}</div>
                      <div className="text-xs text-gray-600">PM2.5 (μg/m³)</div>
                    </div>
                    <div className="text-center p-3 bg-cyan-50 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-600">{aq.avg_pm10?.toFixed(1) || 'N/A'}</div>
                      <div className="text-xs text-gray-600">PM10 (μg/m³)</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{aq.avg_o3?.toFixed(1) || 'N/A'}</div>
                      <div className="text-xs text-gray-600">O₃ (μg/m³)</div>
                    </div>
                    <div className="text-center p-3 bg-indigo-50 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600">{aq.avg_no2?.toFixed(1) || 'N/A'}</div>
                      <div className="text-xs text-gray-600">NO₂ (μg/m³)</div>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-500 text-center">
                    Last Updated: {aq.year}-{String(aq.month).padStart(2, '0')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}