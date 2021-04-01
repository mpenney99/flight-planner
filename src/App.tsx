import { RecoilRoot } from 'recoil';
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
            </div>
        </RecoilRoot>
    );
}

export default App;
