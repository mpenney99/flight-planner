import { useEffect, useRef } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { flightConfigAtomFamily, flightIdsAtom, uasAtomFamily, uasIdsAtom } from '../atoms';
import { useFlightMap } from '../context';
import { EventType, FlightPlayer } from '../player/FlightPlayer';
import { FlightConfig, PlayMode, UAS } from '../types';

type Props = {
    flightId: string;
};

function useFlightPlayer(flightId: string, flightConfig: FlightConfig) {
    const flightPlayer = useRef<FlightPlayer>();
    const initialFlightConfig = useRef(flightConfig);
    const { playRepeat, playMode } = flightConfig;

    const onUasUpdated = useRecoilCallback(
        ({ set }) => (uasId: string, uas: UAS) => {
            set(uasAtomFamily(uasId), uas);
            set(uasIdsAtom, (uasIds) =>
                uasIds.indexOf(uasId) < 0 ? uasIds.concat([uasId]) : uasIds
            );
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
}

function useFlightPath(flightId: string, flightConfig: FlightConfig) {
    const flightMap = useFlightMap();
    const path = flightConfig.path;

    useEffect(() => {
        if (flightMap) {
            flightMap.updatePath(flightId, path);
        }
    }, [flightId, flightMap, path]);

    useEffect(() => {
        if (flightMap) {
            return () => {
                flightMap.removePath(flightId);
            };
        }
    }, [flightId, flightMap]);
}

export function Flight({ flightId }: Props) {
    const flightConfig = useRecoilValue(flightConfigAtomFamily(flightId));
    useFlightPlayer(flightId, flightConfig);
    useFlightPath(flightId, flightConfig);
    return null;
}

export function Flights() {
    const flightIds = useRecoilValue(flightIdsAtom);
    return (
        <>
            {flightIds.map((flightId) => (
                <Flight key={flightId} flightId={flightId} />
            ))}
        </>
    );
}
