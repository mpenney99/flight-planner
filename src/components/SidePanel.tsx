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
        <div
            className="p-3 bg-light d-flex flex-column justify-content-center"
            style={{ width: 320 }}
        >
            {selectedFlightId ? (
                <div className="flex-grow-1">
                    <h2 className="text-primary text-center mb-3">
                        <FontAwesomeIcon icon={faPlane} /> Flight Planner
                    </h2>
                    <FlightPicker />
                    <br />
                    <FlightDetails flightId={selectedFlightId} />
                </div>
            ) : (
                <h4 className="text-primary text-center">Draw a path on the map to start</h4>
            )}
        </div>
    );
}
