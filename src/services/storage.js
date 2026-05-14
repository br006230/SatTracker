import { STORAGE_KEYS } from '../config.js';

// Thin, versioned wrapper over localStorage. All values are JSON-serialized.
// Safe to call in environments without `window` (returns the default).

function safeGetItem(key) {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key, value) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* quota exceeded or storage disabled — silently drop */
  }
}

export function readJSON(key, fallback) {
  const raw = safeGetItem(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  safeSetItem(key, JSON.stringify(value));
}

// Convenience accessors for the three app-level keys.

export function loadMonitoringList() {
  return readJSON(STORAGE_KEYS.monitoringList, null);
}
export function saveMonitoringList(list) {
  writeJSON(STORAGE_KEYS.monitoringList, list);
}

export function loadTLECache() {
  return readJSON(STORAGE_KEYS.tleCache, {});
}
export function saveTLECache(cache) {
  writeJSON(STORAGE_KEYS.tleCache, cache);
}

export function loadLastFetchedAt() {
  return readJSON(STORAGE_KEYS.lastFetchedAt, null);
}
export function saveLastFetchedAt(ts) {
  writeJSON(STORAGE_KEYS.lastFetchedAt, ts);
}
