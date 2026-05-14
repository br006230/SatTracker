import { createContext, useContext, useEffect, useReducer } from 'react';
import { reducer, buildInitialState } from './reducer.js';
import {
  saveMonitoringList,
  saveTLECache,
  saveLastFetchedAt,
} from '../services/storage.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);

  // Persist whichever slices the user cares about between sessions.
  useEffect(() => {
    saveMonitoringList(state.monitoringList);
  }, [state.monitoringList]);

  useEffect(() => {
    saveTLECache(state.tleCache);
  }, [state.tleCache]);

  useEffect(() => {
    if (state.status.lastFetchedAt != null) {
      saveLastFetchedAt(state.status.lastFetchedAt);
    }
  }, [state.status.lastFetchedAt]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
