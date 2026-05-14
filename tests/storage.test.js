import { describe, it, expect, beforeEach } from 'vitest';
import {
  readJSON,
  writeJSON,
  loadMonitoringList,
  saveMonitoringList,
  loadTLECache,
  saveTLECache,
  loadLastFetchedAt,
  saveLastFetchedAt,
} from '../src/services/storage.js';

beforeEach(() => {
  localStorage.clear();
});

describe('storage', () => {
  it('round-trips JSON values', () => {
    writeJSON('k', { a: 1, b: [2, 3] });
    expect(readJSON('k', null)).toEqual({ a: 1, b: [2, 3] });
  });

  it('returns the fallback when key is missing', () => {
    expect(readJSON('missing', 'default')).toBe('default');
  });

  it('returns the fallback when value is not valid JSON', () => {
    localStorage.setItem('bad', '{not-json');
    expect(readJSON('bad', { ok: true })).toEqual({ ok: true });
  });

  it('monitoring list helpers round-trip', () => {
    saveMonitoringList(['1', '2', '3']);
    expect(loadMonitoringList()).toEqual(['1', '2', '3']);
  });

  it('TLE cache defaults to empty object', () => {
    expect(loadTLECache()).toEqual({});
    saveTLECache({ '25544': { name: 'ISS' } });
    expect(loadTLECache()).toEqual({ '25544': { name: 'ISS' } });
  });

  it('lastFetchedAt round-trip', () => {
    saveLastFetchedAt(1731600000000);
    expect(loadLastFetchedAt()).toBe(1731600000000);
  });
});
