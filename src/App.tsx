import { RecoilRoot } from 'recoil';
import SettingsMenu from './components/SettingsMenu';
import { SidePanel } from './components/SidePanel';
import { MapView } from './components/map/MapView';
import { FlightPlayerComponents } from './components/player/FlightPlayerComponent';

function App() {
    return (
        <RecoilRoot>
            <div className="app">
                <SidePanel />
                <MapView />
                <FlightPlayerComponents />
                <SettingsMenu />
            </div>
        </RecoilRoot>
    );
}

export default App;
