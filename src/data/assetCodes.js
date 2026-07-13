/**
 * Data Asset ID scheme for the Central Data Asset Catalog / Data Catalog
 * Dashboard. Encodes the same 3 dimensions the catalog is filtered by
 * (Category, Lab Origin, Geography) directly into the asset ID:
 *   {CATEGORY}-{LAB}-{GEO}-{sequence}
 * e.g. GIS-DDU-HUE-482
 */

export const CATEGORY_CODES = {
  'Survey Fields (Excel/Form)':  'SUR',
  'Spatial Vectors (GIS/Drone)': 'GIS',
  'Remote Sensing (Raster/GEE)': 'RS',
  'Sensor Networks (IoT)':       'IOT',
};

// Keyed by any text the lab/research-unit name might appear as across the
// app (Research List units and the DataCatalog "Lab Origin" filter labels).
export const LAB_CODES = {
  'Public Space Lab':                  'PSA',
  'DDUD Lab':                          'DDU',
  'Data Driven and Urban Design':      'DDU',
  'MOVE System Lab':                   'MOV',
  'MOVE System':                       'MOV',
  'Climate Resilience Lab':            'CRL',
  'Governance and Planning':           'GOV',
  'Fund Raising':                      'FUN',
  'Immersive Tech Convergence Center': 'ITC',
  'Net Zero Open lab':                 'NZO',
  'New Economy':                       'NEW',
  'Smart City':                        'SMC',
  'Individual':                        'IND',
  'IndividualTEAM':                    'IND',
};

// Keyed by the same keywords used in the DataCatalog "Geography" filter.
export const GEO_CODES = {
  'HCMC':    'HCM',
  'Hue':     'HUE',
  'Da Nang': 'DAN',
  'Mekong':  'MKD',
};

const fallbackCode = (text) =>
  (text || '').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'GEN';

export const categoryCode = (category) => CATEGORY_CODES[category] || fallbackCode(category);

export const detectLabCode = (text) => {
  if (!text) return 'GEN';
  const hit = Object.keys(LAB_CODES).find(k => text.toLowerCase().includes(k.toLowerCase()));
  return hit ? LAB_CODES[hit] : fallbackCode(text);
};

export const detectGeoCode = (text) => {
  if (!text) return 'GEN';
  const hit = Object.keys(GEO_CODES).find(k => text.toLowerCase().includes(k.toLowerCase()));
  return hit ? GEO_CODES[hit] : fallbackCode(text);
};

/** Builds a new asset ID: {CAT}-{LAB}-{GEO}-{3-digit sequence}. */
export const buildAssetId = ({ category, source, scope }) => {
  const cat = categoryCode(category);
  const lab = detectLabCode(source);
  const geo = detectGeoCode(scope);
  const seq = String(Date.now()).slice(-3);
  return `${cat}-${lab}-${geo}-${seq}`;
};
