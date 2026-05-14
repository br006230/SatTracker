import { describe, it, expect } from 'vitest';
import { propagate } from '../src/services/propagator.js';

// A well-formed ISS TLE. Epoch values are arbitrary for this test — we only
// care that propagation produces physically plausible numbers (no NaNs, a
// reasonable LEO altitude, sub-orbital speed in the right ballpark).
const ISS_TLE = {
  name: 'ISS (ZARYA)',
  line1: '1 25544U 98067A   24158.50000000  .00012345  00000+0  22222-3 0  9991',
  line2: '2 25544  51.6400 100.0000 0006000 100.0000 260.0000 15.50000000300000',
};

describe('propagate', () => {
  it('produces lat/lon/alt/velocity for a valid TLE + Date', () => {
    const pos = propagate(ISS_TLE, new Date('2024-06-06T12:00:00Z'));
    expect(pos).not.toBeNull();
    expect(Number.isFinite(pos.lat)).toBe(true);
    expect(Number.isFinite(pos.lon)).toBe(true);
    expect(Number.isFinite(pos.alt)).toBe(true);
    expect(Number.isFinite(pos.velocity)).toBe(true);
  });

  it('returns altitude in a reasonable LEO range (300-500 km)', () => {
    const pos = propagate(ISS_TLE, new Date('2024-06-06T12:00:00Z'));
    expect(pos.alt).toBeGreaterThan(300);
    expect(pos.alt).toBeLessThan(500);
  });

  it('returns velocity near orbital speed for LEO (~7-8 km/s)', () => {
    const pos = propagate(ISS_TLE, new Date('2024-06-06T12:00:00Z'));
    expect(pos.velocity).toBeGreaterThan(6);
    expect(pos.velocity).toBeLessThan(9);
  });

  it('latitude stays within ISS inclination bounds (~52 deg)', () => {
    const pos = propagate(ISS_TLE, new Date('2024-06-06T12:00:00Z'));
    expect(Math.abs(pos.lat)).toBeLessThanOrEqual(52);
  });
});
