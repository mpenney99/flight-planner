import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { flightConfigAtomFamily } from '../../atoms';
import { FlightMap } from './FlightMap';

type Props = {
    flightId: string;
    flightMap: FlightMap;
};

export function FlightPathRenderer({ flightId, flightMap }: Props) {
    const { path, lineColor } = useRecoilValue(flightConfigAtomFamily(flightId));

    // update the path on the map
    useEffect(() => {
        flightMap.updatePath(flightId, path);
    }, [flightId, flightMap, path]);

    // update the path color
    useEffect(() => {
        flightMap.setPathColor(flightId, lineColor);
    }, [flightId, flightMap, lineColor]);

    // remove the path from the map on unmount
    useEffect(() => {
        return () => {
            flightMap.removePath(flightId);
        };
    }, [flightId, flightMap]);

    // don't render anthing
    return null;
}
