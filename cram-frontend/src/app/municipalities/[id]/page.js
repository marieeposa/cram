'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchMunicipalities, fetchMunicipalityAIReport } from '@/lib/api';
import Link from 'next/link';
import { 
  ArrowLeft, MapPin, Users, TrendingUp, AlertTriangle, 
  Download, Brain, Loader2, Building2 
} from 'lucide-react';
import MunicipalityChart from '@/components/MunicipalityChart';

export default function MunicipalityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [municipality, setMunicipality] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const municipalities = await fetchMunicipalities();
        const found = municipalities.find(m => m.id === parseInt(params.id));
        
        if (!found) {
          router.push('/municipalities');
          return;
        }
        
        setMunicipality(found);

        // Load AI report
        setAiLoading(true);
        try {
          const report = await fetchMunicipalityAIReport(params.id);
          setAiReport(report);
        } catch (aiError) {
          console.error('AI report failed:', aiError);
        } finally {
          setAiLoading(false);
        }
      } catch (error) {
        console.error('Error loading municipality:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-xl text-gray-600">Loading municipality data...</div>
        </div>
      </div>
    );
  }

  if (!municipality) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/municipalities')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Municipalities
          </button>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <Building2 size={48} />
                <div>
                  <h1 className="text-4xl font-bold">{municipality.name}</h1>
                  <p className="text-lg opacity-90 mt-1">{municipality.province}</p>
                </div>
              </div>
              {municipality.classification && (
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  {municipality.classification}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={18} />
                  <span className="text-sm opacity-90">Barangays</span>
                </div>
                <div className="text-3xl font-bold">{municipality.barangay_count || 0}</div>
              </div>
              
              {municipality.population && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={18} />
                    <span className="text-sm opacity-90">Population</span>
                  </div>
                  <div className="text-3xl font-bold">{municipality.population.toLocaleString()}</div>
                </div>
              )}

              {municipality.land_area && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={18} />
                    <span className="text-sm opacity-90">Land Area</span>
                  </div>
                  <div className="text-2xl font-bold">{municipality.land_area} km²</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Report */}
        {aiReport && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 mb-8 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Brain className="text-purple-600 animate-pulse" size={32} />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">AI Strategic Report</h2>
                  <p className="text-sm text-purple-600">Municipal Climate Resilience Analysis</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Download size={18} />
                Export PDF
              </button>
            </div>
            
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-purple-600 mr-3" size={24} />
                <span className="text-gray-600">Generating strategic analysis...</span>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 whitespace-pre-wrap text-gray-800 leading-relaxed">
                {aiReport.report}
              </div>
            )}

            {aiReport.data && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Avg BRRS</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {aiReport.data.avg_brrs?.toFixed(1) || 'N/A'}
                  </div>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="text-sm text-gray-600">High Risk</div>
                  <div className="text-2xl font-bold text-red-600">
                    {aiReport.data.high_risk_count || 0}
                  </div>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Medium Risk</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {aiReport.data.medium_risk_count || 0}
                  </div>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Coastal</div>
                  <div className="text-2xl font-bold text-cyan-600">
                    {aiReport.data.coastal_count || 0}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Charts */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" />
            Barangay Risk Distribution
          </h2>
          <MunicipalityChart municipalityId={municipality.id} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href={`/barangays?municipality=${municipality.name}`}
            className="flex items-center gap-3 p-6 bg-white/90 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
          >
            <MapPin className="text-blue-600" size={32} />
            <div>
              <div className="font-bold text-gray-900">View All Barangays</div>
              <div className="text-sm text-gray-600">Browse {municipality.barangay_count} barangays</div>
            </div>
          </Link>

          <Link
            href={`/map?municipality=${municipality.name}`}
            className="flex items-center gap-3 p-6 bg-white/90 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
          >
            <MapPin className="text-green-600" size={32} />
            <div>
              <div className="font-bold text-gray-900">View on Map</div>
              <div className="text-sm text-gray-600">Interactive risk visualization</div>
            </div>
          </Link>

          <button className="flex items-center gap-3 p-6 bg-white/90 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100">
            <AlertTriangle className="text-orange-600" size={32} />
            <div className="text-left">
              <div className="font-bold text-gray-900">Setup Alerts</div>
              <div className="text-sm text-gray-600">Get notified of risks</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}