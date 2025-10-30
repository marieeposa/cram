'use client';
import { useEffect, useState } from 'react';
import { fetchBarangays } from '@/lib/api';
import RiskBadge from '@/components/RiskBadge';
import Link from 'next/link';
import { Search, MapPin, Users, Filter } from 'lucide-react';

export default function BarangaysPage() {
  const [barangays, setBarangays] = useState([]);
  const [filteredBarangays, setFilteredBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [municipalityFilter, setMunicipalityFilter] = useState('All');

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Fetching barangays...');
        const data = await fetchBarangays();
        console.log('Barangays loaded:', data.length);
        setBarangays(data);
        setFilteredBarangays(data);
      } catch (error) {
        console.error('Error loading barangays:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let filtered = barangays;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(b => {
        const props = b.properties || b;
        return (
          (props.name && props.name.toLowerCase().includes(searchLower)) ||
          (props.municipality && props.municipality.toLowerCase().includes(searchLower))
        );
      });
    }

    if (riskFilter !== 'All') {
      filtered = filtered.filter(b => {
        const props = b.properties || b;
        const score = props.resilience_score || 0;
        if (riskFilter === 'High') return score >= 50;
        if (riskFilter === 'Medium') return score >= 30 && score < 50;
        if (riskFilter === 'Low') return score < 30;
        return true;
      });
    }

    if (municipalityFilter !== 'All') {
      filtered = filtered.filter(b => {
        const props = b.properties || b;
        return props.municipality === municipalityFilter;
      });
    }

    setFilteredBarangays(filtered);
  }, [searchTerm, riskFilter, municipalityFilter, barangays]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <div className="text-2xl text-gray-600 font-semibold">Loading barangays...</div>
        </div>
      </div>
    );
  }

  const municipalities = ['All', ...new Set(barangays.map(b => {
    const props = b.properties || b;
    return props.municipality;
  }).filter(Boolean))].sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Barangay Directory
          </h1>
          <p className="text-gray-600 text-lg">
            📍 Browse all {barangays.length} barangays in Negros Oriental
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-blue-600" size={24} />
            <h3 className="font-bold text-lg text-gray-900">Filter Barangays</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search barangay or municipality..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
            >
              <option value="All">All Risk Levels</option>
              <option value="High">🔴 High Risk (≥50)</option>
              <option value="Medium">⚠️ Medium Risk (30-49)</option>
              <option value="Low">✅ Low Risk (&lt;30)</option>
            </select>

            <select
              value={municipalityFilter}
              onChange={(e) => setMunicipalityFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
            >
              {municipalities.map(muni => (
                <option key={muni} value={muni}>{muni}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <strong className="text-blue-600 text-lg">{filteredBarangays.length}</strong> of <strong>{barangays.length}</strong> barangays
            </div>
            {(searchTerm || riskFilter !== 'All' || municipalityFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRiskFilter('All');
                  setMunicipalityFilter('All');
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {filteredBarangays.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBarangays.map((barangayFeature) => {
              const barangay = barangayFeature.properties || barangayFeature;
              const barangayId = barangay.id || barangayFeature.id;
              const score = barangay.resilience_score || 0;

              return (
                <Link
                  key={barangayId}
                  href={`/barangays/${barangayId}`}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 text-white">
                    <h3 className="text-xl font-bold group-hover:scale-105 transition-transform">
                      {barangay.name}
                    </h3>
                    <p className="text-sm opacity-90 flex items-center gap-1">
                      <MapPin size={14} />
                      {barangay.municipality}
                    </p>
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <RiskBadge
                        level={barangay.risk_level}
                        score={score}
                      />
                    </div>

                    <div className="space-y-2 text-sm">
                      {barangay.population && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Users size={14} />
                            Population
                          </span>
                          <span className="font-bold text-gray-900">
                            {barangay.population.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-600">BRRS Score</span>
                        <span className="font-bold text-blue-600 text-lg">
                          {score ? score.toFixed(1) : 'N/A'}
                        </span>
                      </div>

                      {barangay.is_coastal && (
                        <div className="mt-2">
                          <span className="px-3 py-1 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 rounded-full text-xs font-bold border border-cyan-200">
                            🌊 Coastal Area
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-100">
                    <div className="text-blue-600 font-semibold group-hover:text-blue-800 flex items-center justify-between">
                      <span>View Full Analysis</span>
                      <span className="group-hover:translate-x-2 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/90 rounded-2xl shadow-xl">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Barangays Found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setRiskFilter('All');
                setMunicipalityFilter('All');
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}