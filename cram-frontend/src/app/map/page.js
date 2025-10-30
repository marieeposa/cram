'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { fetchBarangays } from '@/lib/api';
import InfoTooltip from '@/components/InfoTooltip';
import { GLOSSARY } from '@/lib/glossary';
import { Info as InfoIcon } from 'lucide-react';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function MapPage() {
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ low: 0, medium: 0, high: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchBarangays();
        console.log('Map page - barangays loaded:', data.length);
        setBarangays(data);
        
        const counts = { low: 0, medium: 0, high: 0 };
        data.forEach(b => {
          const props = b.properties || b;
          const score = props.resilience_score || 0;
          if (score < 30) counts.low++;
          else if (score < 50) counts.medium++;
          else counts.high++;
        });
        setStats(counts);
      } catch (error) {
        console.error('Error loading map:', error);
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
          <div className="text-xl text-gray-600">Loading interactive map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Interactive Risk Map
          </h1>
          <div className="text-gray-600 text-lg flex items-center justify-center gap-2">
            <span>🗺️ Barangay BRRS Scores Across Negros Oriental</span>
            <InfoTooltip {...GLOSSARY.brrs} />
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <InfoIcon className="text-blue-600" size={24} />
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-1">
              BRRS Risk Levels
              <InfoTooltip {...GLOSSARY.riskLevel} />
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-400 shadow-lg"></div>
              <div className="flex-1">
                <div className="font-semibold text-green-900">Low Risk (&lt;30)</div>
                <div className="text-sm text-green-700">{stats.low} barangays</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg"></div>
              <div className="flex-1">
                <div className="font-semibold text-yellow-900">Medium Risk (30-50)</div>
                <div className="text-sm text-yellow-700">{stats.medium} barangays</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 shadow-lg"></div>
              <div className="flex-1">
                <div className="font-semibold text-red-900">High Risk (&gt;50)</div>
                <div className="text-sm text-red-700">{stats.high} barangays</div>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-gray-100 overflow-hidden">
          <Map barangays={barangays} activeLayers={{ brrs: true }} />
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-gray-600 bg-blue-50 rounded-xl p-4 border border-blue-200">
          <strong>💡 How to use:</strong> Click on any barangay polygon to see detailed risk information and analysis.
        </div>
      </div>
    </div>
  );
}