import { describe, it, expect } from 'vitest';
import { parseTLEText } from '../src/services/tleService.js';

const ISS_TLE = `ISS (ZARYA)
1 25544U 98067A   24158.50000000  .00012345  00000+0  22222-3 0  9991
2 25544  51.6400 100.0000 0006000 100.0000 260.0000 15.50000000300000`;

describe('parseTLEText', () => {
  it('parses a single 3-line TLE block', () => {
    const records = parseTLEText(ISS_TLE);
    expect(records).toHaveLength(1);
    expect(records[0].name).toBe('ISS (ZARYA)');
    expect(records[0].noradId).toBe('25544');
    expect(records[0].line1.startsWith('1 25544')).toBe(true);
    expect(records[0].line2.startsWith('2 25544')).toBe(true);
  });

  it('handles trailing whitespace and CRLF line endings', () => {
    const text = ISS_TLE.replace(/\n/g, '\r\n') + '\r\n   \r\n';
    const records = parseTLEText(text);
    expect(records).toHaveLength(1);
    expect(records[0].noradId).toBe('25544');
  });

  it('parses multiple satellites in a single response', () => {
    const text = `${ISS_TLE}\nHST
1 20580U 90037B   24158.50000000  .00000800  00000+0  40000-4 0  9990
2 20580  28.4700 200.0000 0002500 100.0000 260.0000 15.10000000400000`;
    const records = parseTLEText(text);
    expect(records).toHaveLength(2);
    expect(records.map((r) => r.noradId)).toEqual(['25544', '20580']);
  });

  it('returns empty array for empty or garbage input', () => {
    expect(parseTLEText('')).toEqual([]);
    expect(parseTLEText('not a tle')).toEqual([]);
  });
});
