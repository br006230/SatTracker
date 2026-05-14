import { useApp } from '../state/AppContext.jsx';
import { ACT } from '../state/reducer.js';

function fmtAlt(km) {
  return Number.isFinite(km) ? `${km.toFixed(0)} km` : '—';
}

export default function SatelliteList() {
  const { state, dispatch } = useApp();
  const { monitoringList, tleCache, positions, selectedId } = state;

  if (monitoringList.length === 0) {
    return (
      <div style={{ padding: 14, color: '#8a93a6', fontSize: 12 }}>
        No satellites in your list. Add one below.
      </div>
    );
  }

  return (
    <div className="list">
      {monitoringList.map((id) => {
        const tle = tleCache[id];
        const pos = positions[id];
        const name = tle?.name ?? `NORAD ${id}`;
        const selected = id === selectedId;
        return (
          <div
            key={id}
            className={`sat-item${selected ? ' selected' : ''}`}
            onClick={() => dispatch({ type: ACT.SELECT, payload: selected ? null : id })}
            title={`NORAD ${id}`}
          >
            <span className="name">{name}</span>
            <span className="meta">{pos ? fmtAlt(pos.alt) : '…'}</span>
          </div>
        );
      })}
    </div>
  );
}
