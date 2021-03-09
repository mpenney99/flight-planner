import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { flightConfigAtomFamily } from '../atoms';
import { useFlightMap } from '../context';

// renders the flight-path on the map

type Props = {
    flightId: string;
};

export default function FlightPathComponent({ flightId }: Props) {
    const flightMap = useFlightMap();
    const { path, lineColor } = useRecoilValue(flightConfigAtomFamily(flightId));

    // update the path on the map
    useEffect(() => {
        if (flightMap) {
            flightMap.updatePath(flightId, path);
        }
    }, [flightId, flightMap, path]);

    // update the color of the path
    useEffect(() => {
        if (flightMap) {
            flightMap.setPathColor(flightId, lineColor);
        }
    }, [flightId, flightMap, lineColor]);

    // remove the path from the map when the component is unmounted
    useEffect(() => {
        if (flightMap) {
            return () => {
                flightMap.removePath(flightId);
            };
        }
    }, [flightId, flightMap]);

    return null;
}
