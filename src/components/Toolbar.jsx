import { useApp } from '../state/AppContext.jsx';

export default function Toolbar({ onRefresh }) {
  const { state } = useApp();
  const fetching = state.status.fetching;
  return (
    <div className="toolbar">
      <h1>SatTracker</h1>
      <button
        className="btn"
        onClick={onRefresh}
        disabled={fetching}
        title="Re-fetch TLEs from CelesTrak"
      >
        {fetching ? 'Refreshing…' : '⟳ Refresh TLEs'}
      </button>
    </div>
  );
}
