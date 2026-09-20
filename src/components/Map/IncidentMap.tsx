import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Crosshair, Eye, Filter, Layers, MapPin, ShieldAlert, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import { Incident, SeverityLevel } from '../../types';

interface IncidentMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  showImpactRadius: boolean;
  onToggleImpactRadius: () => void;
}

export const IncidentMap: React.FC<IncidentMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  showImpactRadius,
  onToggleImpactRadius,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circlesLayerRef = useRef<L.LayerGroup | null>(null);

  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default to Mumbai / Urban coordinates from seed data
      const defaultCenter: [number, number] = [19.0760, 72.8777];

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
        zoomControl: false,
      });

      // CartoDB Dark Matter / Stadia dark tiles for sleek intelligence dashboard aesthetics
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Dedicated layer groups
      const circlesLayer = L.layerGroup().addTo(map);
      const markersLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      circlesLayerRef.current = circlesLayer;
      markersLayerRef.current = markersLayer;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Impact Radius Circles whenever incidents, selectedIncident, or showImpactRadius changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const circlesLayer = circlesLayerRef.current;

    if (!map || !markersLayer || !circlesLayer) return;

    markersLayer.clearLayers();
    circlesLayer.clearLayers();

    const getSeverityColor = (sev: SeverityLevel) => {
      switch (sev) {
        case 5:
          return { bg: '#ef4444', ring: '#f87171', border: '#b91c1c', text: 'Critical' }; // Red
        case 4:
          return { bg: '#f97316', ring: '#fb923c', border: '#c2410c', text: 'High' }; // Orange
        case 3:
          return { bg: '#eab308', ring: '#fde047', border: '#a16207', text: 'Significant' }; // Yellow
        case 2:
          return { bg: '#3b82f6', ring: '#60a5fa', border: '#1d4ed8', text: 'Moderate' }; // Blue
        default:
          return { bg: '#10b981', ring: '#34d399', border: '#047857', text: 'Low' }; // Green
      }
    };

    incidents.forEach((inc) => {
      const isSelected = selectedIncident?.id === inc.id;
      const color = getSeverityColor(inc.severity);

      // Impact Radius Circle
      if (showImpactRadius && inc.impactRadiusMeters > 0) {
        const circle = L.circle([inc.latitude, inc.longitude], {
          radius: inc.impactRadiusMeters,
          color: color.bg,
          fillColor: color.bg,
          fillOpacity: isSelected ? 0.22 : 0.12,
          weight: isSelected ? 2 : 1.5,
          dashArray: isSelected ? '4, 4' : '3, 6',
        });

        circle.bindTooltip(
          `<strong>${inc.title}</strong><br/>Estimated impact area: ~${(inc.impactRadiusMeters / 1000).toFixed(1)} km radius`,
          { sticky: true, className: 'leaflet-custom-tooltip' }
        );

        circle.addTo(circlesLayer);
      }

      // Marker DivIcon with pulse effect for critical/emerging
      const isEmerging = inc.isEmerging;
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="transform: translate(-50%, -50%);">
          ${
            isEmerging || inc.severity >= 4
              ? `<div class="absolute -inset-2 rounded-full animate-ping opacity-60" style="background-color: ${color.ring};"></div>`
              : ''
          }
          <div class="relative flex items-center justify-center rounded-full shadow-xl transition-transform duration-200 group-hover:scale-110"
               style="width: ${isSelected ? '36px' : '28px'}; height: ${isSelected ? '36px' : '28px'}; background: ${color.bg}; border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.4);">
            <span style="color: white; font-weight: 800; font-size: ${isSelected ? '12px' : '10px'}; font-family: monospace;">
              ${inc.reportCount}
            </span>
          </div>
          ${
            isSelected
              ? `<div class="absolute -bottom-6 whitespace-nowrap px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] shadow border border-slate-700">#${inc.id}</div>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: markerHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([inc.latitude, inc.longitude], { icon: customIcon });

      // Popup with rich incident preview
      const popupHtml = `
        <div class="p-2 min-w-[220px] font-sans text-slate-800">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
              #${inc.id}
            </span>
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style="background: ${color.bg}">
              ${inc.priorityLevel} Priority (${inc.priorityScore}/100)
            </span>
          </div>
          <h4 class="font-bold text-xs text-slate-900 leading-snug mb-1">${inc.title}</h4>
          <p class="text-[11px] text-slate-600 mb-2">📍 ${inc.locationName}</p>
          <div class="bg-slate-50 p-1.5 rounded border border-slate-200 text-[11px] mb-2">
            <strong class="text-cyan-700">${inc.reportCount} citizen reports</strong> consolidated into 1 incident.
            ${inc.isEmerging ? '<br/><span class="text-rose-600 font-semibold">⚡ Emerging Incident (Rapid Increase)</span>' : ''}
          </div>
          <button id="view-incident-btn-${inc.id}" class="w-full text-center bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] font-semibold py-1 px-2 rounded cursor-pointer transition-colors">
            Inspect Full Intelligence
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280 });

      marker.on('click', () => {
        onSelectIncident(inc);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-incident-btn-${inc.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectIncident(inc);
            map.closePopup();
          };
        }
      });

      marker.addTo(markersLayer);
    });

    // If an incident was selected, center the map on it
    if (selectedIncident && map) {
      map.flyTo([selectedIncident.latitude, selectedIncident.longitude], 14, {
        duration: 0.8,
      });
    }
  }, [incidents, selectedIncident, showImpactRadius, onSelectIncident]);

  // Geolocation trigger
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserCoords(coords);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(coords, 14, { duration: 1 });

          // Add temporary user location marker
          const userIcon = L.divIcon({
            className: 'user-loc-marker',
            html: `
              <div class="relative flex items-center justify-center">
                <div class="w-4 h-4 bg-cyan-500 rounded-full border-2 border-white shadow-lg animate-ping absolute"></div>
                <div class="w-4 h-4 bg-cyan-600 rounded-full border-2 border-white shadow-md relative"></div>
              </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          L.marker(coords, { icon: userIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup('<strong>You are here</strong><br/>Scanning nearby urban incident clusters...')
            .openPopup();
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationError(`Location error: ${err.message}. Ensure permission is granted.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleResetBounds = () => {
    if (!mapInstanceRef.current || incidents.length === 0) return;
    const bounds = L.latLngBounds(incidents.map((i) => [i.latitude, i.longitude]));
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
  };

  return (
    <div className="relative w-full h-full min-h-[440px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Overlay Controls */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 shadow-lg text-xs flex flex-col gap-2 max-w-[240px]">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Live City Grid
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {incidents.length} Clusters
            </span>
          </div>

          {/* Impact Radius Toggle */}
          <button
            onClick={onToggleImpactRadius}
            className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg border text-[11px] transition-all cursor-pointer ${
              showImpactRadius
                ? 'bg-cyan-950/70 border-cyan-700 text-cyan-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Eye className="w-3 h-3" />
              Impact Radius
            </span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-900">
              {showImpactRadius ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Fit all bounds */}
          <button
            onClick={handleResetBounds}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors"
          >
            <Filter className="w-3 h-3 text-cyan-400" />
            <span>Fit All Incidents</span>
          </button>
        </div>
      </div>

      {/* Top Right Zoom & Locate Me Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          title="Detect near me (GPS permission required)"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-700 shadow-md backdrop-blur-sm transition-all"
        >
          <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        <div className="flex flex-col bg-slate-900/90 rounded-lg border border-slate-700 shadow-md backdrop-blur-sm overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="flex items-center justify-center w-8 h-8 text-slate-300 hover:bg-slate-800 hover:text-white border-b border-slate-800 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="flex items-center justify-center w-8 h-8 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Severity Legend */}
      <div className="absolute bottom-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-2 shadow-lg text-[11px] flex items-center gap-3 text-slate-300">
        <span className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">
          Severity:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>Mod</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Sig</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span>High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span className="font-semibold text-rose-400">Critical</span>
        </div>
      </div>

      {/* Geolocation Error Toast */}
      {locationError && (
        <div className="absolute bottom-12 right-3 z-30 bg-rose-950/90 border border-rose-800 text-rose-200 text-xs px-3 py-2 rounded-xl shadow-lg flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{locationError}</span>
          <button
            onClick={() => setLocationError(null)}
            className="text-rose-400 hover:text-white font-bold ml-1 text-sm"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};
