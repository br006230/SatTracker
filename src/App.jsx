import 'cesium/Build/Cesium/Widgets/widgets.css';
import { AppProvider } from './state/AppContext.jsx';
import Globe from './components/Globe.jsx';

export default function App() {
  return (
    <AppProvider>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Globe />
      </div>
    </AppProvider>
  );
}
