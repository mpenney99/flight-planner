import { atom, atomFamily } from 'recoil';
import { update_interval } from './config.json';
import { FlightConfig, PlayMode, Settings, UAS, VehicleType } from './types';
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
        path: [],
        securityGroup: '',
        vehicleType: VehicleType.UAS
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

export const showSettingsAtom = atom<boolean>({
    key: 'showSettings',
    default: false
});

export const settingsAtom = atom<Settings>({
    key: 'settings',
    default: {
        envId: envs[0].id,
        updateInterval: update_interval
    }
});
