import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { uasAtomFamily } from '../../atoms';
import { FlightMap } from './FlightMap';

type Props = {
    uasId: string;
    flightMap: FlightMap;
};

export function UasRenderer({ uasId, flightMap }: Props) {
    const uas = useRecoilValue(uasAtomFamily(uasId));

    // update the UAS on the map
    useEffect(() => {
        flightMap.updateUas(uasId, uas);
    }, [uas, flightMap, uasId]);

    // remove the UAS from the map on unmount
    useEffect(() => {
        return () => flightMap.removeUas(uasId);
    }, [flightMap, uasId]);

    // don't render anything
    return null;
}
