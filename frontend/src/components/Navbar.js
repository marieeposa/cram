'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, List, Building2, ChevronDown, Cloud, Heart } from 'lucide-react';
import { fetchMunicipalities } from '@/lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const [showMunicipalities, setShowMunicipalities] = useState(false);
  const [municipalities, setMunicipalities] = useState([]);

  useEffect(() => {
    const loadMunicipalities = async () => {
      try {
        const data = await fetchMunicipalities();
        setMunicipalities(data);
      } catch (error) {
        console.error('Failed to load municipalities:', error);
      }
    };
    loadMunicipalities();
  }, []);

  const links = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/map', label: 'Map', icon: Map },
    { href: '/barangays', label: 'Barangays', icon: List },
    { href: '/support', label: 'Support', icon: Heart },
    { href: '/weather', label: 'Weather', icon: Cloud },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white shadow-2xl sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="text-3xl group-hover:scale-110 transition-transform duration-300">🌍</div>
            <div>
              <div className="text-xl font-bold tracking-tight">CRAM</div>
              <div className="text-xs opacity-90 -mt-1 whitespace-nowrap">Climate Resilience Action Matrix</div>
            </div>
          </Link>
          
          <div className="flex items-center space-x-1">
            {links.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-blue-900 shadow-lg scale-105'
                      : 'hover:bg-white/10 hover:scale-105'
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              );
            })}

            {/* Municipalities Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMunicipalities(!showMunicipalities)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                  pathname.startsWith('/municipalities')
                    ? 'bg-white text-blue-900 shadow-lg scale-105'
                    : 'hover:bg-white/10 hover:scale-105'
                }`}
              >
                <Building2 size={18} />
                <span className="hidden lg:inline">Municipalities</span>
                <ChevronDown size={16} className={`transition-transform ${showMunicipalities ? 'rotate-180' : ''}`} />
              </button>

              {showMunicipalities && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMunicipalities(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      <Link
                        href="/municipalities"
                        onClick={() => setShowMunicipalities(false)}
                        className="block px-4 py-3 text-gray-900 hover:bg-blue-50 rounded-lg font-semibold border-b border-gray-200"
                      >
                        📊 View All Municipalities
                      </Link>
                      {municipalities.map((muni) => (
                        <Link
                          key={muni.id}
                          href={`/municipalities/${muni.id}`}
                          onClick={() => setShowMunicipalities(false)}
                          className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <div className="font-medium">{muni.name}</div>
                          <div className="text-xs text-gray-500">
                            {muni.barangay_count || 0} barangays
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}