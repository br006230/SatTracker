import { useEffect } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { ACT } from '../state/reducer.js';
import { TICK_INTERVAL_MS } from '../config.js';
import { buildSatrec, propagateSatrec } from '../services/propagator.js';

// Drives the 1 Hz position update loop. Re-builds the satrec cache whenever
// the monitoring list or TLE cache changes; clears the interval on unmount.
export function useTick() {
  const { state, dispatch } = useApp();
  const { monitoringList, tleCache } = state;

  useEffect(() => {
    if (monitoringList.length === 0) return undefined;

    const satrecs = {};
    for (const id of monitoringList) {
      const tle = tleCache[id];
      if (tle) {
        try {
          satrecs[id] = buildSatrec(tle);
        } catch {
          /* ignore unparsable TLE */
        }
      }
    }

    function update() {
      const now = new Date();
      const positions = {};
      for (const id of Object.keys(satrecs)) {
        const pos = propagateSatrec(satrecs[id], now);
        if (pos) positions[id] = { ...pos, t: now.getTime() };
      }
      dispatch({ type: ACT.UPDATE_POSITIONS, payload: positions });
    }

    update();
    const handle = setInterval(update, TICK_INTERVAL_MS);
    return () => clearInterval(handle);
  }, [monitoringList, tleCache, dispatch]);
}
