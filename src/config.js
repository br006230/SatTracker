// Default monitoring list and app-wide constants.
// NORAD IDs verified against CelesTrak.

export const DEFAULT_SATELLITES = [
  { noradId: '32060', name: 'WorldView-1' },
  { noradId: '35946', name: 'WorldView-2' },
  { noradId: '40115', name: 'WorldView-3' },
  { noradId: '33331', name: 'GeoEye-1' },
  { noradId: '59625', name: 'Legion 1' },
  { noradId: '59626', name: 'Legion 2' },
  { noradId: '60452', name: 'Legion 3' },
  { noradId: '60453', name: 'Legion 4' },
  { noradId: '62900', name: 'Legion 5' },
  { noradId: '62901', name: 'Legion 6' },
];

// CelesTrak GP query endpoint (returns plain TLE text when FORMAT=TLE).
export const CELESTRAK_GP_URL =
  'https://celestrak.org/NORAD/elements/gp.php';

// Position update interval (ms). 1 Hz per FR-7 / NFR-1.
export const TICK_INTERVAL_MS = 1000;

// Versioned localStorage keys so future schema changes don't clobber data.
export const STORAGE_KEYS = {
  monitoringList: 'sattracker.v1.monitoringList',
  tleCache: 'sattracker.v1.tleCache',
  lastFetchedAt: 'sattracker.v1.lastFetchedAt',
};
