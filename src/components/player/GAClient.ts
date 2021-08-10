import { Env, getEnvUrl } from '../../utils/environment';

export type Track = {
    latitude: number;
    longitude: number;
    sequence: number;
    altitude: number;
    trueHeading: number;
    magneticHeading: number | null;
    groundSpeed: number;
    altitudeReference: string;
    altitudeUnit: string;
    source: string;
    callSign: string;
    vehicleType: string;
    transponderId: string;
    env: Env;
};

export class GAClient {
    sendTrack({
        latitude,
        longitude,
        sequence,
        altitude,
        trueHeading,
        magneticHeading,
        groundSpeed,
        altitudeReference,
        altitudeUnit,
        source,
        callSign,
        vehicleType,
        transponderId,
        env
    }: Track) {
        const body = JSON.stringify([
            {
                source: source || 'FLIGHTGEAR',
                sourceId: source || 'FLIGHTGEAR',
                sequence: sequence,
                timestamp: new Date().toISOString(),
                location: {
                    latitude: latitude,
                    longitude: longitude
                },
                altitude: {
                    altitude: altitude,
                    unit: altitudeUnit,
                    reference: altitudeReference || 'MSL'
                },
                callSign: callSign || 'OO-UNIFLY',
                vehicleType: vehicleType || 'AIRPLANE',
                heading: {
                    trueHeading,
                    magneticHeading
                },
                aircraftData: {
                    groundSpeed: groundSpeed
                },
                identification: transponderId ? transponderId : 'UNKNOWN',
                apiKey: env.apiKey
            }
        ]);

        return fetch(getEnvUrl(env), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body
        });
    }
}
