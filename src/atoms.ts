import { atom, atomFamily, selector, selectorFamily } from 'recoil';
import * as yup from 'yup';
import { update_interval } from './config.json';
import { FlightConfig, PlayMode, Settings, UAS, VehicleType } from './types';
import { persistInLocalStorageEffect } from './utils/atomEffects';
import { envs } from './utils/environment';

const settingsSchema: yup.SchemaOf<Settings> = yup.object({
    envId: yup.string().required(),
    updateInterval: yup.number().required()
});

export const flightConfigAtomFamily = atomFamily<FlightConfig, string>({
    key: 'flight',
    default: {
        lineColor: '',
        playMode: PlayMode.STOPPED,
        playRepeat: false,
        transponderId: '',
        callSign: '',
        speedMs: 20,
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
        position: {
            lat: 0,
            lon: 0,
            alt: 0
        }
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
    },
    effects_UNSTABLE: [
        persistInLocalStorageEffect('settings', (value) =>
            settingsSchema.isValidSync(value, { strict: true })
        )
    ]
});

export const environmentNameSelector = selector<string>({
    key: 'environmentName',
    get: ({ get }) => {
        const envId = get(settingsAtom).envId;
        return envs.find((env) => env.id === envId)!.name;
    }
});
