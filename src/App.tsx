import { ToastProvider } from 'react-toast-notifications';
import { RecoilRoot } from 'recoil';
import SettingsMenu from './components/SettingsMenu';
import { SidePanel } from './components/SidePanel';
import { MapView } from './components/map/MapView';
import { FlightPlayerComponents } from './components/player/FlightPlayerComponent';

function App() {
    return (
        <RecoilRoot>
            <ToastProvider>
                <div className="app">
                    <SidePanel />
                    <MapView />
                    <FlightPlayerComponents />
                    <SettingsMenu />
                </div>
            </ToastProvider>
        </RecoilRoot>
    );
}

export default App;
