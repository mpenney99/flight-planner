import { Env, getEnvUrl } from '../../utils/environment';

export type Track = {
    latitude: number;
    longitude: number;
    sequence: number;
    altitude: number;
    heading: number;
    trueHeading: number;
    groundSpeed: number;
    altitudeReference: string;
    altitudeUnit: string;
    source: string;
    callSign: string;
    vehicleType: string;
    transponderId: string;
    securityGroup: string;
    env: Env;
};

export class GAClient {
    sendTrack({
        latitude,
        longitude,
        sequence,
        altitude,
        heading,
        trueHeading,
        groundSpeed,
        altitudeReference,
        altitudeUnit,
        source,
        callSign,
        vehicleType,
        transponderId,
        securityGroup,
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
                callSign,
                vehicleType: vehicleType || 'AIRPLANE',
                heading: {
                    trueHeading: trueHeading,
                    magneticHeading: heading
                },
                aircraftData: {
                    groundSpeed: groundSpeed
                },
                identification: transponderId ? transponderId : 'UNKNOWN',
                securityGroup: securityGroup,
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
