import { useApp } from '../state/AppContext.jsx';
import { ACT } from '../state/reducer.js';
import SatelliteList from './SatelliteList.jsx';
import AddSatelliteForm from './AddSatelliteForm.jsx';

export default function MonitoringPanel() {
  const { state, dispatch } = useApp();
  const { selectedId } = state;
  const canAct = selectedId != null;

  return (
    <aside className="panel">
      <header>Monitoring ({state.monitoringList.length})</header>
      <SatelliteList />
      <AddSatelliteForm />
      <div className="actions">
        <button
          className="btn"
          disabled={!canAct}
          onClick={() => dispatch({ type: ACT.FOCUS_REQUEST, payload: selectedId })}
          title="Fly the camera to the selected satellite"
        >
          Focus
        </button>
        <button
          className="btn danger"
          disabled={!canAct}
          onClick={() => dispatch({ type: ACT.REMOVE_SATELLITE, payload: selectedId })}
          title="Remove the selected satellite from your list"
        >
          ✕ Remove
        </button>
      </div>
    </aside>
  );
}
