'use client';
import { useEffect, useState } from 'react';
import { fetchStatistics, fetchHighRisk, fetchAirQuality, fetchAirQualityAIAnalysis, fetchBarangays } from '@/lib/api';
import StatsCard from '@/components/StatsCard';
import RiskBadge from '@/components/RiskBadge';
import InfoTooltip from '@/components/InfoTooltip';
import { GLOSSARY } from '@/lib/glossary';
import AlertSystem from '@/components/AlertSystem';
import RealTimeIndicator from '@/components/RealTimeIndicator';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import AdvancedVisualizations from '@/components/AdvancedVisualizations';
import { AlertTriangle, MapPin, Shield, Wind, TrendingUp, Activity, Brain, Loader2, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [highRisk, setHighRisk] = useState([]);
  const [airQuality, setAirQuality] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [barangaysForAlerts, setBarangaysForAlerts] = useState([]);

  // Real-time data hook
  const { data: realtimeStats, lastUpdate } = useRealTimeData(
    'http://127.0.0.1:8000/api/barangays/statistics/?format=json',
    30000 // Update every 30 seconds
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, riskDataRaw, aqData, allBarangays] = await Promise.all([
          fetchStatistics(),
          fetchHighRisk(),
          fetchAirQuality(),
          fetchBarangays()
        ]);
        
        setStats(statsData);
        setBarangaysForAlerts(allBarangays);
        
        // Handle both array and paginated response
        let riskData = [];
        if (Array.isArray(riskDataRaw)) {
          riskData = riskDataRaw;
        } else if (riskDataRaw.results) {
          // Handle FeatureCollection
          riskData = riskDataRaw.results.features || riskDataRaw.results;
        } else if (riskDataRaw.features) {
          riskData = riskDataRaw.features;
        }
        
        setHighRisk(riskData.slice(0, 5));
        setAirQuality(aqData.slice(0, 3));

        // Load AI analysis
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
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Update stats with real-time data
  useEffect(() => {
    if (realtimeStats) {
      setStats(realtimeStats);
    }
  }, [realtimeStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-xl text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Climate Resilience Dashboard
            </h1>
            <RealTimeIndicator lastUpdate={lastUpdate} />
          </div>
          <div className="text-gray-600 text-lg flex items-center justify-center gap-2">
            <MapPin size={20} className="text-blue-600" />
            Negros Oriental Barangay Resilience Monitoring System
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group hover:scale-105 transition-transform duration-300">
            <StatsCard
              title="Total Barangays"
              value={stats?.total_barangays || 0}
              icon={<MapPin className="w-8 h-8" />}
              color="blue"
            />
          </div>
          
          <div className="group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-1">
              <StatsCard
                title="Average BRRS"
                value={stats?.resilience_stats?.avg_score?.toFixed(1) || '0.0'}
                icon={<Activity className="w-8 h-8" />}
                color="green"
              />
              <InfoTooltip {...GLOSSARY.brrs} />
            </div>
          </div>
          
          <div className="group hover:scale-105 transition-transform duration-300">
            <StatsCard
              title="Medium Risk"
              value={stats?.resilience_stats?.medium_risk || 0}
              icon={<AlertTriangle className="w-8 h-8" />}
              color="yellow"
            />
          </div>
          
          <div className="group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-1">
              <StatsCard
                title="Coastal Barangays"
                value={stats?.coastal_barangays || 24}
                icon={<Wind className="w-8 h-8" />}
                color="blue"
              />
              <InfoTooltip {...GLOSSARY.coastal} />
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        {aiAnalysis && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 mb-8 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="text-purple-600 animate-pulse" size={32} />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Air Quality Analysis</h2>
                <p className="text-sm text-purple-600">Powered by Llama 3.3 70B</p>
              </div>
            </div>
            
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-purple-600 mr-3" size={24} />
                <span className="text-gray-600">Analyzing regional air quality...</span>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 whitespace-pre-wrap text-gray-800 leading-relaxed">
                {aiAnalysis.analysis}
              </div>
            )}
            
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <span>Analysis period: {aiAnalysis?.period}</span>
              <Link href="/air-quality" className="text-blue-600 hover:text-blue-800 font-semibold">
                View Full Air Quality Data →
              </Link>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Risk Barangays */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="text-orange-600" size={28} />
                Top Risk Barangays
                <InfoTooltip {...GLOSSARY.riskLevel} />
              </h2>
              <Link href="/barangays" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                View All →
              </Link>
            </div>
            
            {highRisk.length > 0 ? (
              <div className="space-y-3">
                {highRisk.map((brgyFeature, idx) => {
                  // Handle both Feature format and direct object
                  const brgy = brgyFeature.properties || brgyFeature;
                  const brgyId = brgy.id || brgyFeature.id;
                  
                  return (
                    <Link
                      key={brgyId || idx}
                      href={`/barangays/${brgyId}`}
                      className="block p-4 border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:border-orange-300 transition-all duration-300 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold text-sm">
                            #{idx + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{brgy.name}</h3>
                            <p className="text-sm text-gray-600">{brgy.municipality}</p>
                          </div>
                        </div>
                        <RiskBadge 
                          level={brgy.risk_level} 
                          score={brgy.resilience_score}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="text-green-800 font-semibold text-lg">✅ Excellent News!</p>
                <p className="text-green-700 mt-2">No high-risk barangays detected in Negros Oriental</p>
              </div>
            )}
          </div>

          {/* Latest Air Quality */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Wind className="text-cyan-600" size={28} />
                Latest Air Quality
                <InfoTooltip {...GLOSSARY.airQuality} />
              </h2>
              <Link href="/air-quality" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                View All →
              </Link>
            </div>
            
            <div className="space-y-4">
              {airQuality.map((aq) => (
                <div key={aq.id} className="p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-cyan-50 to-blue-50 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg text-gray-900">{aq.municipality_name}</h3>
                    <span className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-bold shadow-md">
                      AQI: {aq.avg_aqi?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">PM2.5</span>
                      <span className="font-semibold text-gray-900">{aq.avg_pm25?.toFixed(1) || 'N/A'} μg/m³</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">PM10</span>
                      <span className="font-semibold text-gray-900">{aq.avg_pm10?.toFixed(1) || 'N/A'} μg/m³</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">O₃</span>
                      <span className="font-semibold text-gray-900">{aq.avg_o3?.toFixed(1) || 'N/A'} μg/m³</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">NO₂</span>
                      <span className="font-semibold text-gray-900">{aq.avg_no2?.toFixed(1) || 'N/A'} μg/m³</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hazard Coverage */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" size={28} />
            Hazard Data Coverage
            <InfoTooltip {...GLOSSARY.hazardExposure} />
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'NOAH Flood', count: stats?.hazard_coverage?.noah_flood || 0, color: 'from-blue-500 to-cyan-500', icon: '🌊' },
              { name: 'Storm Surge', count: stats?.hazard_coverage?.storm_surge || 0, color: 'from-cyan-500 to-teal-500', icon: '🌪️' },
              { 
                name: 'Liquefaction', 
                count: stats?.hazard_coverage?.liquefaction || 0, 
                color: 'from-amber-500 to-orange-500', 
                icon: '⚠️',
                tooltip: GLOSSARY.liquefaction
              },
              { name: 'Landslide', count: stats?.hazard_coverage?.landslide || 0, color: 'from-orange-500 to-red-500', icon: '⛰️' },
            ].map((hazard) => (
              <div key={hazard.name} className="group relative text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="text-5xl mb-3">{hazard.icon}</div>
                <div className={`text-4xl font-bold bg-gradient-to-r ${hazard.color} bg-clip-text text-transparent mb-2`}>
                  {hazard.count}
                </div>
                <div className="text-sm text-gray-600 font-medium flex items-center justify-center gap-1">
                  {hazard.name}
                  {hazard.tooltip && <InfoTooltip {...hazard.tooltip} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Visualizations Section */}
        <div className="mt-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <BarChart3 className="text-indigo-600" size={40} />
              <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Advanced Analytics & Insights
              </h2>
            </div>
            <p className="text-gray-600 text-lg">
              📊 Deep dive into climate resilience data with interactive visualizations
            </p>
          </div>
          
          <AdvancedVisualizations barangays={barangaysForAlerts} />
        </div>
      </div>

      {/* Alert System - Floating at bottom right */}
      <AlertSystem barangays={barangaysForAlerts} />
    </div>
  );
}