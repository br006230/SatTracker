import { propagateSatrec } from './propagator.js';

// Compute a ground track ending at `endDate`, going back `durationMs` in time,
// sampled every `stepMs`. Returns an array of { lat, lon, t } ordered oldest
// -> newest, where `t` is the sample's epoch ms. The newest sample (last in
// the array) is at exactly `endDate`.
export function computeGroundTrack(satrec, endDate, durationMs, stepMs) {
  if (!satrec || !endDate || durationMs <= 0 || stepMs <= 0) return [];
  const endMs = endDate.getTime();
  const startMs = endMs - durationMs;
  const samples = [];
  for (let t = startMs; t <= endMs; t += stepMs) {
    const pos = propagateSatrec(satrec, new Date(t));
    if (pos) samples.push({ lat: pos.lat, lon: pos.lon, t });
  }
  return samples;
}
