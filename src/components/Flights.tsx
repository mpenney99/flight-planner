import { Fragment } from 'react';
import { useRecoilValue } from 'recoil';
import { flightIdsAtom } from '../atoms';
import FlightPathComponent from './FlightPath';
import { FlightPlayerComponent } from './FlightPlayer';

export function Flights() {
    const flightIds = useRecoilValue(flightIdsAtom);
    return (
        <>
            {flightIds.map((flightId) => (
                <Fragment key={flightId}>
                    <FlightPathComponent flightId={flightId} />
                    <FlightPlayerComponent flightId={flightId} />
                </Fragment>
            ))}
        </>
    );
}
