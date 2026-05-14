import { useState } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { ACT } from '../state/reducer.js';
import { fetchTLEForQuery } from '../services/tleService.js';

export default function AddSatelliteForm() {
  const { state, dispatch } = useApp();
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const tle = await fetchTLEForQuery(q);
      if (state.monitoringList.includes(tle.noradId)) {
        setErr(`Already monitoring ${tle.name}`);
      } else {
        dispatch({
          type: ACT.TLE_FETCH_SUCCESS,
          payload: { records: [tle], at: Date.now() },
        });
        dispatch({ type: ACT.ADD_SATELLITE, payload: { noradId: tle.noradId } });
        setQuery('');
      }
    } catch (e) {
      setErr(e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="NORAD ID or name (e.g. 25544, ISS)"
        disabled={busy}
      />
      <button className="btn primary" type="submit" disabled={busy || !query.trim()}>
        {busy ? '…' : 'Add'}
      </button>
      {err && (
        <div style={{ flexBasis: '100%', color: '#ff8a8a', fontSize: 11, marginTop: 4 }}>
          {err}
        </div>
      )}
    </form>
  );
}
