'use client';
import { useEffect, useState } from 'react';
import { use } from 'react';
import { fetchBarangayById, fetchBarangayAIAnalysis } from '@/lib/api';
import RiskBadge from '@/components/RiskBadge';
import PDFExport from '@/components/PDFExport';
import Link from 'next/link';
import { ArrowLeft, MapPin, Users, AlertTriangle, Brain, Loader2, TrendingUp } from 'lucide-react';

export default function BarangayDetailPage({ params }) {
  // Unwrap params Promise for Next.js 15
  const unwrappedParams = use(params);
  const barangayId = unwrappedParams.id;
  
  const [barangay, setBarangay] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Fetching barangay ID:', barangayId);
        const data = await fetchBarangayById(barangayId);
        console.log('Received data:', data);
        
        // Handle GeoJSON format
        let barangayData = data;
        if (data.type === 'Feature' && data.properties) {
          barangayData = data.properties;
        }
        
        console.log('Processed barangay data:', barangayData);
        setBarangay(barangayData);

        // Load AI analysis
        setAiLoading(true);
        try {
          const aiData = await fetchBarangayAIAnalysis(barangayId);
          setAiAnalysis(aiData);
        } catch (aiError) {
          console.error('AI analysis failed:', aiError);
        } finally {
          setAiLoading(false);
        }
      } catch (error) {
        console.error('Error loading barangay:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [barangayId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-xl text-gray-600">Loading barangay details...</div>
        </div>
      </div>
    );
  }

  if (error || !barangay) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Barangay Not Found
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 max-w-md mx-auto">
            <p className="text-red-800">
              <strong>Requested ID:</strong> {barangayId}
            </p>
            {error && (
              <p className="text-red-600 mt-2">
                <strong>Error:</strong> {error}
              </p>
            )}
          </div>
          <p className="text-gray-600 mb-4">
            Could not load barangay details from the API.
          </p>
          <Link href="/barangays" className="text-blue-600 hover:underline">
            ← Back to Barangays
          </Link>
        </div>
      </div>
    );
  }

  const resilience = barangay.resilience || {};
  const hazards = barangay.hazards || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/barangays"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-semibold transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Barangays
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 mb-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {barangay.name || 'Unknown'}
              </h1>
              <p className="text-xl opacity-90 flex items-center gap-2">
                <MapPin size={20} />
                {barangay.municipality || 'Unknown'}, {barangay.province || 'Negros Oriental'}
              </p>
            </div>
            <RiskBadge
              level={resilience.risk_level}
              score={resilience.overall_score}
            />
          </div>
        </div>

        {/* AI Analysis */}
        {aiAnalysis && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 mb-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Brain className="text-purple-600 animate-pulse" size={32} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">AI Strategic Analysis</h2>
                  <p className="text-sm text-purple-600">Personalized Resilience Recommendations</p>
                </div>
              </div>
            </div>
            
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-purple-600 mr-3" size={24} />
                <span className="text-gray-600">Generating analysis...</span>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 whitespace-pre-wrap text-gray-800 leading-relaxed">
                {aiAnalysis.analysis}
              </div>
            )}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Demographics */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="text-blue-600" />
              Demographics
            </h2>
            <div className="space-y-3">
              {barangay.population && (
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Population</span>
                  <span className="font-semibold text-gray-900">{barangay.population.toLocaleString()}</span>
                </div>
              )}
              {barangay.households && (
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Households</span>
                  <span className="font-semibold text-gray-900">{barangay.households.toLocaleString()}</span>
                </div>
              )}
              {barangay.total_area && (
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Total Area</span>
                  <span className="font-semibold text-gray-900">{barangay.total_area.toFixed(2)} km²</span>
                </div>
              )}
              {barangay.poverty_incidence !== null && barangay.poverty_incidence !== undefined && (
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Poverty Incidence</span>
                  <span className="font-semibold text-gray-900">{barangay.poverty_incidence.toFixed(1)}%</span>
                </div>
              )}
              <div className="flex justify-between py-3">
                <span className="text-gray-600">Location Type</span>
                <span className="font-semibold text-gray-900">
                  {barangay.is_coastal ? '🌊 Coastal' : '🏔️ Inland'}
                </span>
              </div>
            </div>
          </div>

          {/* Resilience Scores */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-600" />
              Resilience Assessment
            </h2>
            <div className="space-y-4">
              {resilience.overall_score !== null && resilience.overall_score !== undefined && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Overall BRRS</span>
                    <span className="font-bold text-xl text-blue-600">
                      {resilience.overall_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(resilience.overall_score, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {resilience.hazard_exposure_score !== null && resilience.hazard_exposure_score !== undefined && (
                <div className="py-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hazard Exposure (40%)</span>
                    <span className="font-semibold text-gray-900">
                      {resilience.hazard_exposure_score.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}

              {resilience.health_sensitivity_score !== null && resilience.health_sensitivity_score !== undefined && (
                <div className="py-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Health Sensitivity (30%)</span>
                    <span className="font-semibold text-gray-900">
                      {resilience.health_sensitivity_score.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}

              {resilience.adaptive_capacity_score !== null && resilience.adaptive_capacity_score !== undefined && (
                <div className="py-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Adaptive Capacity (30%)</span>
                    <span className="font-semibold text-gray-900">
                      {resilience.adaptive_capacity_score.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}

              {resilience.data_completeness !== null && resilience.data_completeness !== undefined && (
                <div className="pt-4 text-sm text-gray-600 border-t border-gray-200">
                  Data Completeness: {resilience.data_completeness.toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hazards */}
        {hazards && hazards.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-orange-600" />
              Identified Hazards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hazards.map((hazard, idx) => (
                <div
                  key={idx}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold capitalize text-gray-900">
                        {hazard.hazard_type ? hazard.hazard_type.replace('_', ' ') : 'Unknown'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Susceptibility: <span className="font-semibold">{hazard.susceptibility || 'N/A'}</span>
                      </p>
                    </div>
                    <div className="text-3xl font-bold text-orange-600">
                      {hazard.susceptibility_score || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <PDFExport 
            barangay={barangay} 
            aiAnalysis={aiAnalysis?.analysis} 
          />
          
          <Link
            href={`/map?barangay=${barangayId}`}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
          >
            <MapPin size={20} />
            View on Map
          </Link>

          <Link
            href="/barangays"
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
          >
            Browse All Barangays
          </Link>
        </div>
      </div>
    </div>
  );
}