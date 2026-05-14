import { describe, it, expect, beforeEach } from 'vitest';
import { reducer, buildInitialState, ACT } from '../src/state/reducer.js';

beforeEach(() => localStorage.clear());

function base() {
  return {
    monitoringList: ['1', '2'],
    tleCache: {},
    positions: { '1': { lat: 0, lon: 0, alt: 400, velocity: 7.5 } },
    selectedId: null,
    status: { lastFetchedAt: null, fetching: false, error: null },
  };
}

describe('reducer', () => {
  it('ADD_SATELLITE appends a new id', () => {
    const next = reducer(base(), { type: ACT.ADD_SATELLITE, payload: { noradId: '3' } });
    expect(next.monitoringList).toEqual(['1', '2', '3']);
  });

  it('ADD_SATELLITE is a no-op for duplicates', () => {
    const s = base();
    expect(reducer(s, { type: ACT.ADD_SATELLITE, payload: { noradId: '1' } })).toBe(s);
  });

  it('REMOVE_SATELLITE drops id, clears selection, and prunes position', () => {
    const s = { ...base(), selectedId: '1' };
    const next = reducer(s, { type: ACT.REMOVE_SATELLITE, payload: '1' });
    expect(next.monitoringList).toEqual(['2']);
    expect(next.selectedId).toBeNull();
    expect(next.positions['1']).toBeUndefined();
  });

  it('SELECT sets selectedId', () => {
    const next = reducer(base(), { type: ACT.SELECT, payload: '2' });
    expect(next.selectedId).toBe('2');
  });

  it('TLE_FETCH_START sets fetching=true and clears error', () => {
    const s = { ...base(), status: { ...base().status, error: 'old' } };
    const next = reducer(s, { type: ACT.TLE_FETCH_START });
    expect(next.status.fetching).toBe(true);
    expect(next.status.error).toBeNull();
  });

  it('TLE_FETCH_SUCCESS merges records and records timestamp', () => {
    const next = reducer(base(), {
      type: ACT.TLE_FETCH_SUCCESS,
      payload: {
        records: [{ noradId: '1', name: 'A', line1: 'x', line2: 'y' }],
        at: 999,
      },
    });
    expect(next.tleCache['1'].name).toBe('A');
    expect(next.status.lastFetchedAt).toBe(999);
    expect(next.status.fetching).toBe(false);
  });

  it('TLE_FETCH_ERROR stores message and clears fetching', () => {
    const next = reducer(base(), { type: ACT.TLE_FETCH_ERROR, payload: 'boom' });
    expect(next.status.error).toBe('boom');
    expect(next.status.fetching).toBe(false);
  });

  it('UPDATE_POSITIONS replaces positions object', () => {
    const next = reducer(base(), {
      type: ACT.UPDATE_POSITIONS,
      payload: { '2': { lat: 1, lon: 2, alt: 500, velocity: 7.6 } },
    });
    expect(next.positions).toEqual({ '2': { lat: 1, lon: 2, alt: 500, velocity: 7.6 } });
  });
});

describe('buildInitialState', () => {
  it('populates with defaults on first run', () => {
    const s = buildInitialState();
    expect(s.monitoringList.length).toBeGreaterThan(0);
    expect(s.status.fetching).toBe(false);
  });

  it('respects persisted monitoring list', () => {
    localStorage.setItem('sattracker.v1.monitoringList', JSON.stringify(['9']));
    const s = buildInitialState();
    expect(s.monitoringList).toEqual(['9']);
  });
});
