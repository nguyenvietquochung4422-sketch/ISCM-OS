import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { Globe2, MapPin, Download, ExternalLink } from 'lucide-react';
import {
  assets, projectById, userById, geoLayers, LOCATION_CENTERS,
} from '../data/mockData.js';
import { FileIcon, SecurityBadge } from '../components/ui.jsx';

/* ------------------------------------------------------------------ */
/* Module 3 — Global Knowledge Commons (Kho Tri thức toàn Viện)        */
/* All 'Internal Open' assets + Central WebGIS for cross-lab overlays  */
/* ------------------------------------------------------------------ */

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 13, { duration: 0.8 }); }, [center, map]);
  return null;
}

const pointToLayer = (color) => (_f, latlng) =>
  L.circleMarker(latlng, { radius: 7, color, fillColor: color, fillOpacity: 0.7, weight: 2 });

export default function KnowledgeCommons() {
  const [location, setLocation] = useState('Nha Trang');

  // The Commons only ever exposes 'Internal Open' assets — mirrors the RLS policy.
  const openAssets = useMemo(() => assets.filter((a) => a.security_level === 'Internal Open'), []);

  // Cross-disciplinary overlay: every open spatial layer whose project sits in the chosen city,
  // regardless of which lab produced it.
  const spatialHere = openAssets.filter(
    (a) => a.asset_type === 'Spatial' && projectById[a.project_id]?.location === location
  );
  const labsOnMap = [...new Set(spatialHere.map((a) => geoLayers[a.layer_key]?.lab).filter(Boolean))];

  return (
    <div className="w-full space-y-6">
      <header>
        <h1 className="font-barlow text-2xl font-bold text-iscm-charcoal">Global Knowledge Commons</h1>
        <p className="font-ibm text-sm text-gray-500">
          Every asset marked <span className="font-medium text-emerald-700">Internal Open</span> — shared across all labs.
        </p>
      </header>

      {/* Central WebGIS */}
      <section className="glass-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-barlow text-lg font-bold text-iscm-charcoal">
            <Globe2 className="h-5 w-5 text-iscm-crimson" /> Central WebGIS — Cross-lab Overlay
          </h2>
          <div className="flex gap-1 rounded-lg bg-iscm-surface p-1">
            {Object.keys(LOCATION_CENTERS).map((city) => (
              <button
                key={city}
                onClick={() => setLocation(city)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-ibm text-sm font-medium transition-colors ${
                  location === city ? 'bg-iscm-crimson text-white' : 'text-gray-600 hover:bg-white'
                }`}
              >
                <MapPin className="h-3.5 w-3.5" /> {city}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[420px] overflow-hidden rounded-2xl">
          <MapContainer center={LOCATION_CENTERS[location]} zoom={13} scrollWheelZoom>
            <FlyTo center={LOCATION_CENTERS[location]} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {spatialHere.map((asset) => {
              const layer = geoLayers[asset.layer_key];
              if (!layer) return null;
              return (
                <GeoJSON
                  key={asset.id}
                  data={layer.data}
                  style={{ color: layer.color, weight: 3, fillColor: layer.color, fillOpacity: 0.15 }}
                  pointToLayer={pointToLayer(layer.color)}
                  onEachFeature={(f, l) => {
                    if (f.properties?.name) l.bindPopup(`<b>${f.properties.name}</b><br/>${layer.name} — ${layer.lab}`);
                  }}
                />
              );
            })}
          </MapContainer>
        </div>

        {/* Legend: which labs are contributing layers to this canvas */}
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <span className="font-barlow-condensed text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
            Contributing labs in {location}:
          </span>
          {labsOnMap.length > 0 ? labsOnMap.map((lab) => (
            <span key={lab} className="badge bg-iscm-crimson/10 text-iscm-crimson">{lab}</span>
          )) : (
            <span className="font-ibm text-xs text-gray-400">No open spatial layers for this location yet.</span>
          )}
        </div>
      </section>

      {/* Unified open-asset catalogue */}
      <section className="glass-card overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-barlow text-lg font-bold text-iscm-charcoal">Open Asset Catalogue</h2>
          <p className="font-ibm text-xs text-gray-500">{openAssets.length} shared assets from all labs</p>
        </div>
        <ul className="divide-y divide-gray-100">
          {openAssets.map((a) => {
            const project = projectById[a.project_id];
            const owner = userById[a.uploaded_by];
            const isLink = a.file_extension === 'url';
            return (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-iscm-surface/40">
                <FileIcon extension={a.file_extension} className="h-5 w-5" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-ibm text-sm font-medium text-iscm-charcoal">{a.asset_name}</div>
                  <div className="truncate font-ibm text-xs text-gray-400">
                    {project?.project_name} · {project?.location} · {owner?.base_lab}
                  </div>
                </div>
                <SecurityBadge level={a.security_level} />
                <a
                  href={a.storage_url}
                  target={isLink ? '_blank' : undefined}
                  rel="noreferrer"
                  className="rounded-lg border border-gray-200 p-2 text-iscm-charcoal hover:border-iscm-crimson hover:text-iscm-crimson"
                >
                  {isLink ? <ExternalLink className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
