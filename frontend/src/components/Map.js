'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map({ barangays, activeLayers = { brrs: true } }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const barangayLayersRef = useRef({});
  const router = useRouter();

  // Initialize map
  useEffect(() => {
    if (typeof window !== 'undefined' && !mapInstanceRef.current && mapRef.current) {
      const map = L.map(mapRef.current).setView([9.3, 123.3], 9);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);
      
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render barangays
  useEffect(() => {
    if (!mapInstanceRef.current || !barangays.length) {
      console.log('Map not ready:', { 
        mapReady: !!mapInstanceRef.current, 
        barangayCount: barangays.length 
      });
      return;
    }

    console.log('Rendering barangays:', barangays.length);

    const map = mapInstanceRef.current;
    
    // Clear existing barangay layers
    Object.values(barangayLayersRef.current).forEach(layer => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
    barangayLayersRef.current = {};

    let validCount = 0;

    // Add barangay polygons
    barangays.forEach((barangay, index) => {
      // Handle both direct properties and nested properties
      const props = barangay.properties || barangay;
      const geom = barangay.geometry;
      
      // CRITICAL FIX: Extract ID from multiple possible locations
      const barangayId = props.id || barangay.id;
      
      if (!geom || !geom.coordinates) {
        console.log('No geometry for:', props.name);
        return;
      }

      if (!barangayId) {
        console.warn('No ID found for barangay:', props.name, 'Structure:', barangay);
      }

      validCount++;

      const score = props.resilience_score || 0;
      const hazards = props.hazards || [];
      
      let color = '#888';
      let fillColor = '#ccc';
      let fillOpacity = 0.3;
      
      if (activeLayers.brrs) {
        if (score < 30) {
          color = '#10b981';
          fillColor = '#34d399';
        } else if (score < 50) {
          color = '#f59e0b';
          fillColor = '#fbbf24';
        } else {
          color = '#ef4444';
          fillColor = '#f87171';
        }
        fillOpacity = 0.5;
      }

      try {
        // Create GeoJSON feature
        const feature = {
          type: 'Feature',
          geometry: geom,
          properties: props
        };

        const layer = L.geoJSON(feature, {
          style: {
            color: color,
            weight: 2,
            fillColor: fillColor,
            fillOpacity: fillOpacity
          }
        }).addTo(map);

        // FIXED: Click handler with proper ID extraction
        layer.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          
          if (barangayId) {
            console.log('Navigating to barangay ID:', barangayId);
            router.push(`/barangays/${barangayId}`);
          } else {
            console.error('Cannot navigate - no ID for:', props.name);
            alert(`Cannot view details: Barangay "${props.name}" has no ID`);
          }
        });

        layer.on('mouseover', (e) => {
          e.target.setStyle({
            weight: 4,
            fillOpacity: 0.8
          });
          
          const hazardsList = hazards.length > 0 
            ? hazards.map(h => `<li>${h.hazard_type}: ${h.susceptibility}</li>`).join('')
            : '<li>No hazards recorded</li>';
          
          L.popup()
            .setLatLng(e.latlng)
            .setContent(`
              <div class="p-3">
                <strong class="text-lg text-gray-900">${props.name}</strong><br/>
                <span class="text-sm text-gray-600">${props.municipality}</span><br/>
                <div class="mt-2">
                  <span class="text-sm font-semibold text-blue-600">BRRS: ${score.toFixed(1)}</span>
                </div>
                <div class="mt-1 text-xs">
                  <strong>Hazards:</strong>
                  <ul class="ml-4 list-disc">${hazardsList}</ul>
                </div>
                <div class="mt-2 text-xs text-blue-600 font-semibold">
                  🖱️ Click for details
                </div>
              </div>
            `)
            .openOn(map);
        });

        layer.on('mouseout', (e) => {
          e.target.setStyle({
            weight: 2,
            fillOpacity: fillOpacity
          });
        });

        // Use ID or index as fallback for layer reference
        const layerKey = barangayId || `layer-${index}`;
        barangayLayersRef.current[layerKey] = layer;
      } catch (error) {
        console.error(`Error adding barangay ${props.name}:`, error);
      }
    });

    console.log('Successfully added', validCount, 'barangays to map');

    if (Object.keys(barangayLayersRef.current).length > 0) {
      const group = L.featureGroup(Object.values(barangayLayersRef.current));
      map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }

  }, [barangays, activeLayers.brrs, router]);

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-[600px] rounded-xl border-2 border-gray-200" />
    </div>
  );
}