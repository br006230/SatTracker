import { useApp } from '../state/AppContext.jsx';

function fmtTimestamp(ms) {
  if (!ms) return 'never';
  const d = new Date(ms);
  return d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
}

export default function StatusBar() {
  const { state } = useApp();
  const { status, monitoringList, positions } = state;
  const tracked = Object.keys(positions).length;

  return (
    <div className="statusbar">
      <span>
        TLEs last refreshed: <span className="pulse">{fmtTimestamp(status.lastFetchedAt)}</span>
        {status.fetching && '  •  fetching…'}
      </span>
      <span>
        {status.error ? <span className="error">{status.error}</span> : null}
        {!status.error && (
          <>
            {tracked} / {monitoringList.length} tracked
          </>
        )}
      </span>
    </div>
  );
}
