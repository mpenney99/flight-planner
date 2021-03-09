import { faPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { selectedFlightIdAtom } from '../atoms';
import { FlightDetails } from './FlightDetails';
import { FlightPicker } from './FlightPicker';

export function SidePanel() {
    const selectedFlightId = useRecoilValue(selectedFlightIdAtom);
    return (
        <div className="bg-light d-flex flex-column justify-content-center" style={{ width: 320 }}>
            {/* header */}
            {selectedFlightId && (
                <div className="p-3">
                    <h2 className="text-primary text-center mb-3">
                        <FontAwesomeIcon className="mr-2" icon={faPlane} />
                        <span>Flight Planner</span>
                    </h2>
                    <FlightPicker />
                </div>
            )}
            {/* body */}
            {selectedFlightId ? (
                <FlightDetails flightId={selectedFlightId} />
            ) : (
                <h4 className="text-primary text-center p-3">Draw a path on the map to start</h4>
            )}
        </div>
    );
}
