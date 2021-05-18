import { useEffect, useRef } from 'react';
import { useToasts } from 'react-toast-notifications';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import {
    flightConfigAtomFamily,
    flightIdsAtom,
    settingsAtom,
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
    const { addToast } = useToasts();
    const flightConfig = useRecoilValue(flightConfigAtomFamily(flightId));
    const { envId, updateInterval } = useRecoilValue(settingsAtom);
    const flightPlayer = useRef<FlightPlayer>();
    const initialFlightConfig = useRef(flightConfig);
    const initialSelectedEnvId = useRef(envId);
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
                case EventType.API_ERROR:
                    addToast(event.error, { appearance: 'error', autoDismiss: true });
                    break;
            }
        });

        return () => {
            fp.stop();
        };
    }, [flightId, onUasCreated, onUasUpdated, onUasRemoved, addToast]);

    useEffect(() => {
        const selectedEnv = getEnvById(envs, envId)!;
        flightPlayer.current!.setEnv(selectedEnv);
    }, [envId]);

    useEffect(() => {
        flightPlayer.current!.setUpdateInterval(updateInterval);
    }, [updateInterval]);

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
