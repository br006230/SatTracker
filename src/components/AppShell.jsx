import './styles/app.css';
import Globe from './Globe.jsx';
import Toolbar from './Toolbar.jsx';
import MonitoringPanel from './MonitoringPanel.jsx';
import StatusBar from './StatusBar.jsx';
import { useTLELoader } from '../hooks/useTLELoader.js';
import { useTick } from '../hooks/useTick.js';

export default function AppShell() {
  const { refresh } = useTLELoader();
  useTick();

  return (
    <div className="app">
      <Toolbar onRefresh={refresh} />
      <MonitoringPanel />
      <div className="globe-host">
        <Globe />
      </div>
      <StatusBar />
    </div>
  );
}
