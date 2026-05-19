import { useEffect, useState } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { buildSatrec } from '../services/propagator.js';
import { computeGroundTrack } from '../services/groundTrack.js';
import {
  GROUND_TRACK_DURATION_MS,
  GROUND_TRACK_STEP_MS,
  GROUND_TRACK_REFRESH_MS,
} from '../config.js';

// Returns the ground track samples for the currently selected satellite,
// recomputed whenever the selection changes and every GROUND_TRACK_REFRESH_MS
// thereafter so the window slides forward in time.
export function useGroundTrack() {
  const { state } = useApp();
  const { selectedId, tleCache } = state;
  const [track, setTrack] = useState([]);

  useEffect(() => {
    if (!selectedId) {
      setTrack([]);
      return undefined;
    }
    const tle = tleCache[selectedId];
    if (!tle) {
      setTrack([]);
      return undefined;
    }
    let satrec;
    try {
      satrec = buildSatrec(tle);
    } catch {
      setTrack([]);
      return undefined;
    }

    function refresh() {
      setTrack(
        computeGroundTrack(
          satrec,
          new Date(),
          GROUND_TRACK_DURATION_MS,
          GROUND_TRACK_STEP_MS,
        ),
      );
    }

    refresh();
    const handle = setInterval(refresh, GROUND_TRACK_REFRESH_MS);
    return () => clearInterval(handle);
  }, [selectedId, tleCache]);

  return track;
}
