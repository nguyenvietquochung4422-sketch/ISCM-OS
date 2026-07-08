import { useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { Layers, Eye, EyeOff } from 'lucide-react';
import { geoLayers } from '../../data/mockData.js';
import { FileIcon, SecurityBadge } from '../ui.jsx';

/* ------------------------------------------------------------------ */
/* Tab 4 — Spatial Map Layers: .shp/.geojson list + Leaflet canvas     */
/* ------------------------------------------------------------------ */

/** Recenter the map when the active project (geolocation) changes */
function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 14, { duration: 0.8 }); }, [center, map]);
  return null;
}

/** Render points as branded circle markers (avoids bundler icon issues) */
const pointToLayer = (color) => (_feature, latlng) =>
  L.circleMarker(latlng, { radius: 7, color, fillColor: color, fillOpacity: 0.7, weight: 2 });

export default function SpatialMapTab({ assets, center }) {
  const spatialAssets = assets.filter((a) => a.asset_type === 'Spatial');
  // layer visibility state keyed by asset id — all on by default
  const [visible, setVisible] = useState(() => Object.fromEntries(spatialAssets.map((a) => [a.id, true])));

  const toggle = (id) => setVisible((v) => ({ ...v, [id]: !v[id] }));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Layer control panel */}
      <aside className="glass-card p-4">
        <h3 className="mb-3 flex items-center gap-2 font-barlow text-sm font-bold uppercase tracking-wide text-iscm-charcoal">
          <Layers className="h-4 w-4 text-iscm-crimson" /> Spatial Layers
        </h3>
        <ul className="space-y-2.5">
          {spatialAssets.map((asset) => {
            const layer = geoLayers[asset.layer_key];
            const isOn = visible[asset.id];
            return (
              <li key={asset.id} className="rounded-xl border border-gray-100 bg-white/70 p-3">
                <div className="flex items-center gap-2.5">
                  <FileIcon extension={asset.file_extension} className="h-5 w-5" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-ibm text-sm font-medium">{asset.asset_name}</div>
                    <div className="font-ibm text-xs text-gray-400">{layer?.lab}</div>
                  </div>
                  <button
                    onClick={() => toggle(asset.id)}
                    className={`rounded-lg p-1.5 transition-colors ${
                      isOn ? 'bg-iscm-crimson text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                    title={isOn ? 'Hide layer' : 'Show layer'}
                  >
                    {isOn ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 font-ibm text-xs text-gray-500">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: layer?.color }} />
                    {layer?.name}
                  </span>
                  <SecurityBadge level={asset.security_level} />
                </div>
              </li>
            );
          })}
          {spatialAssets.length === 0 && (
            <li className="font-ibm text-sm text-gray-400">No spatial layers in this project.</li>
          )}
        </ul>
      </aside>

      {/* Interactive Leaflet canvas */}
      <div className="glass-card h-[480px] overflow-hidden p-1.5 lg:col-span-2">
        <MapContainer center={center} zoom={14} scrollWheelZoom>
          <FlyTo center={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {spatialAssets.map((asset) => {
            const layer = geoLayers[asset.layer_key];
            if (!layer || !visible[asset.id]) return null;
            return (
              <GeoJSON
                key={asset.id}
                data={layer.data}
                style={{ color: layer.color, weight: 3, fillColor: layer.color, fillOpacity: 0.15 }}
                pointToLayer={pointToLayer(layer.color)}
                onEachFeature={(feature, l) => {
                  if (feature.properties?.name) l.bindPopup(`<b>${feature.properties.name}</b><br/>${layer.name}`);
                }}
              />
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
