import { CELESTRAK_GP_URL } from '../config.js';

// Fetch a single satellite's TLE from CelesTrak by NORAD catalog number.
// Returns a TLE record: { noradId, name, line1, line2, fetchedAt }.
// Throws on network failure or "No GP data found".
export async function fetchTLEByNoradId(noradId) {
  const url = `${CELESTRAK_GP_URL}?CATNR=${encodeURIComponent(noradId)}&FORMAT=TLE`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`CelesTrak request failed: ${res.status} ${res.statusText}`);
  }
  const text = (await res.text()).trim();
  if (!text || text.toLowerCase().startsWith('no gp data')) {
    throw new Error(`No TLE found for NORAD ID ${noradId}`);
  }
  const record = parseTLEText(text)[0];
  if (!record) {
    throw new Error(`Could not parse TLE for NORAD ID ${noradId}`);
  }
  return { ...record, fetchedAt: Date.now() };
}

// Fetch a TLE by a free-form query: all-digit input is treated as a NORAD ID,
// anything else is sent as a NAME search and the first match wins.
export async function fetchTLEForQuery(query) {
  const q = query.trim();
  if (!q) throw new Error('Empty query');
  if (/^[0-9]+$/.test(q)) return fetchTLEByNoradId(q);

  const url = `${CELESTRAK_GP_URL}?NAME=${encodeURIComponent(q)}&FORMAT=TLE`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`CelesTrak request failed: ${res.status} ${res.statusText}`);
  }
  const text = (await res.text()).trim();
  if (!text || text.toLowerCase().startsWith('no gp data')) {
    throw new Error(`No TLE found for "${q}"`);
  }
  const records = parseTLEText(text);
  if (records.length === 0) {
    throw new Error(`No TLE found for "${q}"`);
  }
  return { ...records[0], fetchedAt: Date.now() };
}

// Fetch multiple satellites in parallel. Returns { ok: [...], failed: [...] }.
export async function fetchTLEsByNoradIds(noradIds) {
  const results = await Promise.allSettled(noradIds.map(fetchTLEByNoradId));
  const ok = [];
  const failed = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') ok.push(r.value);
    else failed.push({ noradId: noradIds[i], error: r.reason?.message ?? String(r.reason) });
  });
  return { ok, failed };
}

// Parse raw TLE text. CelesTrak returns blocks of 3 lines per satellite:
//   line 0: name
//   line 1: starts with "1 "
//   line 2: starts with "2 "
// Returns an array of { noradId, name, line1, line2 }.
export function parseTLEText(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trimEnd()).filter((l) => l.length > 0);
  const records = [];
  for (let i = 0; i + 2 < lines.length; i += 3) {
    const name = lines[i].trim();
    const line1 = lines[i + 1];
    const line2 = lines[i + 2];
    if (!line1.startsWith('1 ') || !line2.startsWith('2 ')) continue;
    // NORAD ID is columns 3-7 of line 1.
    const noradId = line1.slice(2, 7).trim();
    records.push({ noradId, name, line1, line2 });
  }
  return records;
}
