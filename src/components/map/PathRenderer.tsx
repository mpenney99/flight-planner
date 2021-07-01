import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { flightConfigAtomFamily } from '../../atoms';
import { FlightMap } from './FlightMap';

type Props = {
    pathId: string;
    flightMap: FlightMap;
};

/**
 * Monitors the recoil state and updates the map when it changes
 */

export function PathRenderer({ pathId, flightMap }: Props) {
    const { path, lineColor } = useRecoilValue(flightConfigAtomFamily(pathId));

    // update the path on the map
    useEffect(() => {
        flightMap.pathsLayer.createOrUpdatePath(pathId, path);
    }, [pathId, flightMap, path]);

    // update the path color
    useEffect(() => {
        flightMap.pathsLayer.setPathColor(pathId, lineColor);
    }, [pathId, flightMap, lineColor]);

    // remove the path from the map on unmount
    useEffect(() => {
        return () => {
            flightMap.pathsLayer.removePath(pathId);
        };
    }, [pathId, flightMap]);

    // don't render anthing
    return null;
}
