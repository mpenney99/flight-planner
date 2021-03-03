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
