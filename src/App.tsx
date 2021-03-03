import { useState } from 'react';
import { RecoilRoot } from 'recoil';
import { FlightPaths } from './components/FlightPaths';
import { MapView } from './components/MapView';
import { SidePanel } from './components/SidePanel';
import { Uases } from './components/Uases';
import { flightMapContext } from './context';
import { FlightMap } from './map/FlightMap';

function App() {
    const [flightMap, setFlightMap] = useState<FlightMap | null>(null);

    return (
        <RecoilRoot>
            <flightMapContext.Provider value={flightMap}>
                <div className="app">
                    <SidePanel />
                    <MapView onFlightMapCreated={setFlightMap} />
                    <FlightPaths />
                    <Uases />
                </div>
            </flightMapContext.Provider>
        </RecoilRoot>
    );
}

export default App;
