import { useCallback, useEffect, useRef } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { ACT } from '../state/reducer.js';
import { fetchTLEsByNoradIds } from '../services/tleService.js';

// Performs an initial TLE fetch for every monitored satellite on mount,
// and exposes a `refresh` callback for the toolbar's Refresh button.
export function useTLELoader() {
  const { state, dispatch } = useApp();
  const listRef = useRef(state.monitoringList);
  listRef.current = state.monitoringList;
  const didInit = useRef(false);

  const refresh = useCallback(
    async (ids = listRef.current) => {
      if (!ids || ids.length === 0) return;
      dispatch({ type: ACT.TLE_FETCH_START });
      try {
        const { ok, failed } = await fetchTLEsByNoradIds(ids);
        dispatch({
          type: ACT.TLE_FETCH_SUCCESS,
          payload: { records: ok, at: Date.now() },
        });
        if (failed.length > 0) {
          dispatch({
            type: ACT.TLE_FETCH_ERROR,
            payload: `Failed to fetch: ${failed.map((f) => f.noradId).join(', ')}`,
          });
        }
      } catch (e) {
        dispatch({ type: ACT.TLE_FETCH_ERROR, payload: e.message ?? String(e) });
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    refresh(listRef.current);
  }, [refresh]);

  return { refresh };
}
