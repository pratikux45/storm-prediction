import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { INDIAN_CITIES } from '../data/indian_cities';

// Fix typical leaflet 100% height issues and layer them under our fixed UI
import './WeatherMap.css';

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1.5 });
  }, [center, map]);
  return null;
}

type WeatherMapProps = {
  city: string;
  stormIndex?: string;
  precipitation?: number;
};

export default function WeatherMap({ city, stormIndex = "Low", precipitation = 0 }: WeatherMapProps) {
  const defaultCenter: [number, number] = [20.5937, 78.9629]; 
  const selectedCityData = INDIAN_CITIES.find(c => c.city === city);
  const center: [number, number] = selectedCityData ? [selectedCityData.lat, selectedCityData.lng] : defaultCenter;

  const getMarkerColor = (risk: string) => {
    if (risk.includes('High')) return '#ef4444'; // Red
    if (risk.includes('Moderate')) return '#eab308'; // Yellow
    if (risk.includes('Low')) return '#22c55e'; // Green
    return '#3b82f6';
  };

  return (
    <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl relative z-0 mt-8">
      <MapContainer 
        center={center} 
        zoom={5} 
        scrollWheelZoom={false}
        className="w-full h-full bg-[#0f172a] z-0"
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <MapUpdater center={center} />
        
        {/* Render all cities as markers */}
        {INDIAN_CITIES.map((cityData) => {
          const color = getMarkerColor(cityData.riskLevel);
          const isSelected = cityData.city === city;
          const isCritical = cityData.riskLevel.includes('High');
          
          return (
            <div key={cityData.city}>
              {/* Core Marker */}
              <CircleMarker
                center={[cityData.lat, cityData.lng]}
                pathOptions={{ 
                  color: color, 
                  fillColor: color, 
                  fillOpacity: isSelected ? 1 : 0.7,
                  weight: isSelected ? 3 : 1
                }}
                radius={isSelected ? 8 : 5}
              >
                <LeafletTooltip className="custom-leaflet-tooltip" direction="top" offset={[0, -10]} opacity={1}>
                  <div className="text-center font-sans">
                    <p className="font-bold text-slate-100">{cityData.city}</p>
                    <p className="text-xs text-slate-300">Risk: <span style={{ color }}>{cityData.riskLevel}</span></p>
                  </div>
                </LeafletTooltip>
              </CircleMarker>

              {/* Glowing Wave Ripple for Critical Risks or Selected City */}
              {(isCritical || isSelected) && (
                <CircleMarker
                  center={[cityData.lat, cityData.lng]}
                  pathOptions={{ 
                    color: color, 
                    fillColor: color, 
                    fillOpacity: 0.2,
                    weight: 1,
                    className: isCritical ? 'risk-ripple-critical' : 'risk-ripple-pulse'
                  }}
                  radius={isCritical ? 40 : 25}
                />
              )}
            </div>
          );
        })}
      </MapContainer>
      
      {/* Map Overlay Info Box */}
      <div className="absolute top-4 right-4 z-[1000] bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-lg pointer-events-none min-w-[200px]">
        <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-2 flex items-center gap-2 border-b border-slate-700/50 pb-2">
          <span className={`w-2 h-2 rounded-full inline-block ${stormIndex.includes('High') ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
          Live Radar Focus
        </h4>
        <p className="text-cyan-300 text-lg font-bold">{city}</p>
        <div className="mt-2 text-xs flex flex-col gap-1.5">
          <span className="text-slate-400 flex justify-between gap-4">Threat Level: <span style={{color: getMarkerColor(stormIndex)}} className="font-bold">{stormIndex}</span></span>
          <span className="text-slate-400 flex justify-between gap-4">Precipitation: <span className="text-white font-semibold">{precipitation} mm</span></span>
        </div>
      </div>
    </div>
  );
}
