import { useEffect } from 'react';
import { ToastProvider } from 'react-toast-notifications';
import { useRecoilValue } from 'recoil';
import { environmentNameSelector } from './atoms';
import SettingsMenu from './components/SettingsMenu';
import { SidePanel } from './components/SidePanel';
import { MapView } from './components/map/MapView';
import { FlightPlayerComponents } from './components/player/FlightPlayerComponent';

function App() {
    const environmentName = useRecoilValue(environmentNameSelector);
    useEffect(() => {
        document.title = `Flight-planner (${environmentName})`;
    }, [environmentName]);

    return (
        <ToastProvider>
            <div className="app">
                <SidePanel />
                <MapView />
                <FlightPlayerComponents />
                <SettingsMenu />
            </div>
        </ToastProvider>
    );
}

export default App;
