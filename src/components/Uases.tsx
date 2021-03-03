import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { uasAtomFamily, uasIdsAtom } from '../atoms';
import { useFlightMap } from '../context';

type Props = {
    uasId: string;
};

export function Uas({ uasId }: Props) {
    const uas = useRecoilValue(uasAtomFamily(uasId));
    const flightMap = useFlightMap();

    useEffect(() => {
        if (flightMap) {
            flightMap.updateUas(uasId, uas);
        }
    }, [uas, flightMap, uasId]);

    useEffect(() => {
        if (flightMap) {
            return () => flightMap.removeUas(uasId);
        }
    }, [flightMap, uasId]);

    return null;
}

export function Uases() {
    const uasIds = useRecoilValue(uasIdsAtom);
    return (
        <>
            {uasIds.map((uasId) => (
                <Uas key={uasId} uasId={uasId} />
            ))}
        </>
    );
}
