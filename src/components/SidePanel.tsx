import { faPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRecoilValue } from 'recoil';
import { selectedFlightIdAtom } from '../atoms';
import { EnvSelector } from './EnvSelector';
import { FlightDetails } from './FlightDetails';
import { FlightPicker } from './FlightPicker';

const VERSION = process.env.REACT_APP_VERSION;

export function SidePanel() {
    const selectedFlightId = useRecoilValue(selectedFlightIdAtom);
    return (
        <div className="bg-light d-flex flex-column" style={{ width: 320 }}>
            {/* header */}
            {selectedFlightId && (
                <div className="p-3">
                    <h2 className="text-primary text-center mb-3">
                        <FontAwesomeIcon className="mr-2" icon={faPlane} />
                        <span>Flight Planner</span>
                    </h2>
                    <div className="pb-3">
                        <EnvSelector />
                    </div>
                    <FlightPicker />
                </div>
            )}
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
            <div className="p-2 text-secondary">{VERSION}</div>
        </div>
    );
}
