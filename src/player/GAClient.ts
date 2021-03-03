import { unifly } from '../config.json';

export type Track = {
    latitude: number;
    longitude: number;
    sequence: number;
    altitude: number;
    heading: number;
    trueHeading: number;
    groundSpeed: number;
    altitudeReference: string;
    source: string;
    callSign: string;
    vehicleType: string;
    transponderId: string;
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
        source,
        callSign,
        vehicleType,
        transponderId
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
                    reference: altitudeReference || 'MSL'
                },
                callSign: callSign || 'OO-UNIFLY',
                vehicleType: vehicleType || 'AIRPLANE',
                heading: {
                    trueHeading: trueHeading,
                    magneticHeading: heading
                },
                aircraftData: {
                    groundSpeed: groundSpeed
                },
                identification: transponderId ? transponderId : 'UNKNOWN',
                apiKey: unifly.api_key
            }
        ]);

        return fetch('/api/tracking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body
        }).catch((reject) => {
            console.log(reject);
        });
    }
}
