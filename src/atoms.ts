import { atom, atomFamily } from 'recoil';
import { FlightConfig, PlayMode, UAS } from './types';

export const flightConfigAtomFamily = atomFamily<FlightConfig, string>({
    key: 'flight',
    default: {
        playMode: PlayMode.STOPPED,
        playRepeat: false,
        transponderId: '',
        callSign: '',
        speedKmh: 100,
        altitudeKm: 30,
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
