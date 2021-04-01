import { useEffect, useRef } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import {
    flightConfigAtomFamily,
    flightIdsAtom,
    selectedEnvAtom,
    uasAtomFamily,
    uasIdsAtom
} from '../../atoms';
import { PlayMode, UAS } from '../../types';
import { appendIfNotPresent } from '../../utils/arrayUtils';
import { envs, getEnvById } from '../../utils/environment';
import { EventType, FlightPlayer } from './FlightPlayer';

type Props = {
    flightId: string;
};

export function FlightPlayerComponent({ flightId }: Props) {
    const flightConfig = useRecoilValue(flightConfigAtomFamily(flightId));
    const selectedEnvId = useRecoilValue(selectedEnvAtom);
    const flightPlayer = useRef<FlightPlayer>();
    const initialFlightConfig = useRef(flightConfig);
    const initialSelectedEnvId = useRef(selectedEnvId);
    const { playRepeat, playMode } = flightConfig;

    // handle flight player events, update recoil state

    const onUasCreated = useRecoilCallback(
        ({ set }) => (uasId: string, uas: UAS) => {
            set(uasAtomFamily(uasId), uas);
            set(uasIdsAtom, (uasIds) => appendIfNotPresent(uasIds, uasId));
        },
        []
    );

    const onUasUpdated = useRecoilCallback(
        ({ set }) => (uasId: string, uas: UAS) => {
            set(uasAtomFamily(uasId), uas);
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
        const selectedEnv = getEnvById(envs, initialSelectedEnvId.current)!;
        const fp = new FlightPlayer(flightId, initialFlightConfig.current, selectedEnv);
        flightPlayer.current = fp;

        fp.events.subscribe((event) => {
            switch (event.type) {
                case EventType.UAS_CREATED:
                    onUasCreated(event.uasId, event.uas);
                    break;
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
    }, [flightId, onUasCreated, onUasUpdated, onUasRemoved]);

    useEffect(() => {
        const selectedEnv = getEnvById(envs, selectedEnvId)!;
        flightPlayer.current!.setEnv(selectedEnv);
    }, [selectedEnvId]);

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

    // don't render anything
    return null;
}

export function FlightPlayerComponents() {
    const flightIds = useRecoilValue(flightIdsAtom);
    return (
        <>
            {flightIds.map((flightId) => (
                <FlightPlayerComponent key={flightId} flightId={flightId} />
            ))}
        </>
    );
}
