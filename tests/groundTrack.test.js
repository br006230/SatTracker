import { describe, it, expect } from 'vitest';
import { computeGroundTrack } from '../src/services/groundTrack.js';
import { buildSatrec } from '../src/services/propagator.js';

const ISS_TLE = {
  name: 'ISS (ZARYA)',
  line1: '1 25544U 98067A   24158.50000000  .00012345  00000+0  22222-3 0  9991',
  line2: '2 25544  51.6400 100.0000 0006000 100.0000 260.0000 15.50000000300000',
};

describe('computeGroundTrack', () => {
  const satrec = buildSatrec(ISS_TLE);
  const endDate = new Date('2024-06-06T12:00:00Z');
  const duration = 30 * 60 * 1000;
  const step = 10 * 1000;

  it('returns an empty array for bad inputs', () => {
    expect(computeGroundTrack(null, endDate, duration, step)).toEqual([]);
    expect(computeGroundTrack(satrec, null, duration, step)).toEqual([]);
    expect(computeGroundTrack(satrec, endDate, 0, step)).toEqual([]);
    expect(computeGroundTrack(satrec, endDate, duration, 0)).toEqual([]);
  });

  it('produces duration/step + 1 samples for a clean window', () => {
    const samples = computeGroundTrack(satrec, endDate, duration, step);
    expect(samples).toHaveLength(duration / step + 1);
  });

  it('orders samples oldest -> newest with the last at endDate', () => {
    const samples = computeGroundTrack(satrec, endDate, duration, step);
    expect(samples[samples.length - 1].t).toBe(endDate.getTime());
    for (let i = 1; i < samples.length; i += 1) {
      expect(samples[i].t).toBeGreaterThan(samples[i - 1].t);
    }
  });

  it('returns physically plausible lat/lon for every sample', () => {
    const samples = computeGroundTrack(satrec, endDate, duration, step);
    for (const s of samples) {
      expect(Number.isFinite(s.lat)).toBe(true);
      expect(Number.isFinite(s.lon)).toBe(true);
      expect(Math.abs(s.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(s.lon)).toBeLessThanOrEqual(180);
    }
  });

  it('is deterministic for the same inputs', () => {
    const a = computeGroundTrack(satrec, endDate, duration, step);
    const b = computeGroundTrack(satrec, endDate, duration, step);
    expect(a).toEqual(b);
  });
});
