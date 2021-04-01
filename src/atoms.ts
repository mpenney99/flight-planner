import { atom, atomFamily } from 'recoil';
import { FlightConfig, PlayMode, UAS } from './types';
import { envs } from './utils/environment';

export const flightConfigAtomFamily = atomFamily<FlightConfig, string>({
    key: 'flight',
    default: {
        lineColor: '',
        playMode: PlayMode.STOPPED,
        playRepeat: false,
        transponderId: '',
        callSign: '',
        speedMs: 20,
        altitude: 30,
        path: []
    }
});

export const flightIdsAtom = atom<string[]>({
    key: 'flightIds',
    default: []
});

export const uasAtomFamily = atomFamily<UAS, string>({
    key: 'uas',
    default: {
        position: [0, 0]
    }
});

export const uasIdsAtom = atom<string[]>({
    key: 'uasIds',
    default: []
});

export const selectedFlightIdAtom = atom<string | null>({
    key: 'selectedFlightId',
    default: null
});

export const selectedEnvAtom = atom<string>({
    key: 'selectedEnv',
    default: envs[0].id
});
