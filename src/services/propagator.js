import {
  twoline2satrec,
  propagate as sgp4Propagate,
  gstime,
  eciToGeodetic,
  degreesLat,
  degreesLong,
} from 'satellite.js';

// Build a satrec from a TLE record. Cache-friendly: callers can hold onto
// the satrec and pass it to `propagateSatrec` on each tick.
export function buildSatrec(tleRecord) {
  return twoline2satrec(tleRecord.line1, tleRecord.line2);
}

// Propagate a satrec to a given Date.
// Returns { lat, lon, alt, velocity } where alt is km and velocity km/s.
// Returns null if the propagation produced a non-physical result
// (e.g. decayed satellite or bad TLE).
export function propagateSatrec(satrec, date) {
  const result = sgp4Propagate(satrec, date);
  if (!result || !result.position || !result.velocity) return null;

  const gmst = gstime(date);
  const geo = eciToGeodetic(result.position, gmst);
  if (!Number.isFinite(geo.latitude) || !Number.isFinite(geo.longitude)) {
    return null;
  }

  const v = result.velocity;
  const speedKmS = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

  return {
    lat: degreesLat(geo.latitude),
    lon: degreesLong(geo.longitude),
    alt: geo.height, // km
    velocity: speedKmS,
  };
}

// Convenience: propagate directly from a TLE record without holding a satrec.
export function propagate(tleRecord, date) {
  return propagateSatrec(buildSatrec(tleRecord), date);
}
