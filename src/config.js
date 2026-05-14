// Default monitoring list and app-wide constants.
//
// NORAD IDs for WorldView Legion are looked up live during Stage 4 (Globe)
// and added here once verified. Placeholders below for the well-known sats.

export const DEFAULT_SATELLITES = [
  { noradId: '32060', name: 'WorldView-1' },
  { noradId: '35946', name: 'WorldView-2' },
  { noradId: '40115', name: 'WorldView-3' },
  { noradId: '33331', name: 'GeoEye-1' },
  // WorldView Legion 1-6: NORAD IDs to be verified against CelesTrak.
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
