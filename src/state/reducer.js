import { DEFAULT_SATELLITES } from '../config.js';
import {
  loadMonitoringList,
  loadTLECache,
  loadLastFetchedAt,
} from '../services/storage.js';

// Action types
export const ACT = {
  ADD_SATELLITE: 'ADD_SATELLITE',
  REMOVE_SATELLITE: 'REMOVE_SATELLITE',
  SELECT: 'SELECT',
  TLE_FETCH_START: 'TLE_FETCH_START',
  TLE_FETCH_SUCCESS: 'TLE_FETCH_SUCCESS',
  TLE_FETCH_ERROR: 'TLE_FETCH_ERROR',
  UPDATE_POSITIONS: 'UPDATE_POSITIONS',
};

// Build the initial state. On first run (no persisted list) the user gets
// the default satellites pre-populated; persisted list always wins on reload.
export function buildInitialState() {
  const persistedList = loadMonitoringList();
  const monitoringList =
    persistedList ?? DEFAULT_SATELLITES.map((s) => s.noradId);
  return {
    monitoringList,
    tleCache: loadTLECache() ?? {},
    positions: {},
    selectedId: null,
    status: {
      lastFetchedAt: loadLastFetchedAt(),
      fetching: false,
      error: null,
    },
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case ACT.ADD_SATELLITE: {
      const { noradId } = action.payload;
      if (!noradId || state.monitoringList.includes(noradId)) return state;
      return { ...state, monitoringList: [...state.monitoringList, noradId] };
    }

    case ACT.REMOVE_SATELLITE: {
      const id = action.payload;
      if (!state.monitoringList.includes(id)) return state;
      // eslint-disable-next-line no-unused-vars
      const { [id]: _dropPos, ...positions } = state.positions;
      return {
        ...state,
        monitoringList: state.monitoringList.filter((x) => x !== id),
        selectedId: state.selectedId === id ? null : state.selectedId,
        positions,
      };
    }

    case ACT.SELECT:
      return { ...state, selectedId: action.payload };

    case ACT.TLE_FETCH_START:
      return {
        ...state,
        status: { ...state.status, fetching: true, error: null },
      };

    case ACT.TLE_FETCH_SUCCESS: {
      const { records, at } = action.payload;
      const tleCache = { ...state.tleCache };
      for (const r of records) tleCache[r.noradId] = r;
      return {
        ...state,
        tleCache,
        status: { fetching: false, error: null, lastFetchedAt: at },
      };
    }

    case ACT.TLE_FETCH_ERROR:
      return {
        ...state,
        status: { ...state.status, fetching: false, error: action.payload },
      };

    case ACT.UPDATE_POSITIONS:
      return { ...state, positions: action.payload };

    default:
      return state;
  }
}
