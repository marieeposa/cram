'use client';
import { useEffect, useState } from 'react';
import { fetchMunicipalities } from '@/lib/api';
import Link from 'next/link';
import { MapPin, Users, TrendingUp, Building2 } from 'lucide-react';

export default function MunicipalitiesPage() {
  const [municipalities, setMunicipalities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMunicipalities();
        setMunicipalities(data);
      } catch (error) {
        console.error('Error loading municipalities:', error);
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
          <div className="text-xl text-gray-600">Loading municipalities...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Municipalities
          </h1>
          <p className="text-gray-600 text-lg">
            🏛️ {municipalities.length} Municipalities in Negros Oriental
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {municipalities.map((municipality) => (
            <Link
              key={municipality.id}
              href={`/municipalities/${municipality.id}`}
              className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
                <div className="flex items-start justify-between mb-2">
                  <Building2 size={32} className="text-white/90" />
                  {municipality.classification && (
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                      {municipality.classification}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold group-hover:scale-105 transition-transform">
                  {municipality.name}
                </h3>
                <p className="text-sm opacity-90 mt-1">{municipality.province}</p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin size={18} className="text-blue-600" />
                      <span className="text-sm font-medium">Barangays</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {municipality.barangay_count || 0}
                    </span>
                  </div>

                  {municipality.population && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users size={18} className="text-green-600" />
                        <span className="text-sm font-medium">Population</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {municipality.population.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-gray-100">
                <div className="text-indigo-600 font-semibold group-hover:text-indigo-800 flex items-center justify-between">
                  <span>View Dashboard</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}