import { useRecoilValue } from 'recoil';
import { selectedFlightIdAtom } from '../atoms';
import { FlightDetails } from './FlightDetails';
import SidePanelHeader from './SidePanelHeader';

const VERSION = process.env.REACT_APP_VERSION;

export function SidePanel() {
    const selectedFlightId = useRecoilValue(selectedFlightIdAtom);
    return (
        <div className="bg-light d-flex flex-column" style={{ width: 320 }}>
            <SidePanelHeader />
            {/* body */}
            {selectedFlightId ? (
                <FlightDetails flightId={selectedFlightId} />
            ) : (
                <div className="flex-grow-1 d-flex align-items-center">
                    <h4 className="text-primary text-center p-3">
                        Draw a path on the map to start
                    </h4>
                </div>
            )}
            {/* footer */}
            <div className="text-secondary p-2">{VERSION}</div>
        </div>
    );
}
