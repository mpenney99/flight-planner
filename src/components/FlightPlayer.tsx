import { useEffect, useRef } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { flightConfigAtomFamily, uasAtomFamily, uasIdsAtom } from '../atoms';
import { FlightPlayer, EventType } from '../player/FlightPlayer';
import { UAS, PlayMode } from '../types';
import { appendIfNotPresent } from '../utils/arrayUtils';

// plays the flight, updates the position of the UAS

type Props = {
    flightId: string;
};

export function FlightPlayerComponent({ flightId }: Props) {
    const flightConfig = useRecoilValue(flightConfigAtomFamily(flightId));
    const flightPlayer = useRef<FlightPlayer>();
    const initialFlightConfig = useRef(flightConfig);
    const { playRepeat, playMode } = flightConfig;

    const onUasUpdated = useRecoilCallback(
        ({ set }) => (uasId: string, uas: UAS) => {
            set(uasAtomFamily(uasId), uas);
            set(uasIdsAtom, (uasIds) => appendIfNotPresent(uasIds, uasId));
        },
        []
    );

    const onUasRemoved = useRecoilCallback(
        ({ set, reset }) => (uasId: string) => {
            set(uasIdsAtom, (uasIds) => uasIds.filter((id) => id !== uasId));
            reset(uasAtomFamily(uasId));
        },
        []
    );

    useEffect(() => {
        const fp = new FlightPlayer(flightId, initialFlightConfig.current);
        flightPlayer.current = fp;
        fp.events.subscribe((event) => {
            switch (event.type) {
                case EventType.UAS_UPDATED:
                    onUasUpdated(event.uasId, event.uas);
                    break;
                case EventType.UAS_REMOVED:
                    onUasRemoved(event.uasId);
                    break;
            }
        });

        return () => {
            fp.stop();
        };
    }, [flightId, onUasRemoved, onUasUpdated]);

    useEffect(() => {
        flightPlayer.current!.setConfig(flightConfig);
    }, [flightConfig]);

    useEffect(() => {
        flightPlayer.current!.setPlayRepeat(playRepeat);
    }, [playRepeat]);

    useEffect(() => {
        switch (playMode) {
            case PlayMode.PLAYING:
                flightPlayer.current!.play();
                break;
            case PlayMode.PAUSED:
                flightPlayer.current!.pause();
                break;
            case PlayMode.STOPPED:
                flightPlayer.current!.stop();
                break;
        }
    }, [playMode]);

    return null;
}
