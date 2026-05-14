import 'cesium/Build/Cesium/Widgets/widgets.css';
import { AppProvider } from './state/AppContext.jsx';
import AppShell from './components/AppShell.jsx';

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
