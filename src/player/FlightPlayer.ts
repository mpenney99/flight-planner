import distance from '@turf/distance';
import bearing from '@turf/bearing';
import destination from '@turf/destination';
import { GAClient } from './GAClient';
import { FlightConfig, Point, UAS } from '../types';
import { update_interval } from '../config.json';
import { Subject } from 'rxjs';

const KM_TO_KNOTS = 1.852;

export enum EventType {
    UAS_UPDATED,
    UAS_REMOVED
}

export type Event =
    | { type: EventType.UAS_UPDATED, uasId: string, uas: UAS } 
    | { type: EventType.UAS_REMOVED, uasId: string };

export class FlightPlayer {
    private readonly _client: GAClient = new GAClient();
    private readonly _uasId: string;
    private readonly _events = new Subject<Event>();
    
    private _config: FlightConfig;
    private _playRepeat = false;
    private _startTime = 0;
    private _distOffset = 0;
    private _sequence = 0;
    private _handle: any;

    constructor(uasId: string, config: FlightConfig) {
        this._uasId = uasId;
        this._config = config;
        this._update = this._update.bind(this);
    }

    get events() {
        return this._events;
    }

    setConfig(config: FlightConfig) {
        if (config.speedKmh !== this._config.speedKmh) {
            const timeMillis = new Date().getTime();
            this._distOffset = this._getTotalDistanceTravelledKm(timeMillis);
            this._startTime = timeMillis;
        }
        this._config = config;
    }

    setPlayRepeat(playRepeat: boolean) {
        this._playRepeat = playRepeat;
    }

    play() {
        const now = new Date().getTime();
        this._startTime = now;
        this._handle = setInterval(this._update, update_interval);

        // check if we're paused
        if (this._distOffset !== 0) {
            return;
        }

        this._sequence = 0;
        this._events.next({
            type: EventType.UAS_UPDATED,
            uasId: this._uasId,
            uas: {
                position: this._config.path[0]
            }
        });
    }

    pause() {
        clearInterval(this._handle);
        this._handle = undefined;
        const timeMillis = new Date().getTime();
        this._distOffset = this._getTotalDistanceTravelledKm(timeMillis);
    }

    stop() {
        clearInterval(this._handle);
        this._handle = undefined;
        this._distOffset = 0;

        this._events.next({
            type: EventType.UAS_REMOVED,
            uasId: this._uasId
        });
    }

    private _update(): void {
        const timeMillis = new Date().getTime();
        const totalDistance = this._getTotalDistanceTravelledKm(timeMillis);
        let position = this._getCurrentPosition(totalDistance);

        if (position == null && this._playRepeat) {
            this._startTime = timeMillis;
            this._distOffset = 0;
            position = this._getCurrentPosition(0);
        }

        if (position) {
            const { point, heading } = position;

            this._events.next({
                type: EventType.UAS_UPDATED,
                uasId: this._uasId,
                uas: {
                    position: point
                }
            });

            this._client.sendTrack({
                longitude: point[0],
                latitude: point[1],
                sequence: this._sequence++,
                altitude: this._config.altitudeKm,
                heading,
                trueHeading: 0,
                groundSpeed: this._config.speedKmh / KM_TO_KNOTS,
                altitudeReference: 'MSL',
                source: 'uniflyJsonToFlight',
                callSign: this._config.callSign,
                vehicleType: 'UAS',
                transponderId: this._config.transponderId
            });

        } else {
            this.stop();
        }
    }
    
    private _getCurrentPosition(totalDistance: number): { point: Point, heading: number } | null {
        const path = this._config.path;

        for (let i = 0, n = path.length - 1; i < n; i++) {
            const from = path[i];
            const to = path[i + 1];
            const dist = distance(from, to, { units: 'kilometers' });

            if (totalDistance <= dist) {
                const heading = bearing(from, to);
                const pt = destination(from, totalDistance, heading, { units: 'kilometers' });
                const point = pt.geometry.coordinates as Point;

                return {
                    point,
                    heading
                }
            }

            totalDistance -= dist;
        }

        return null;
    }

    private _getTotalDistanceTravelledKm(timeMillis: number) {
        const deltaMillis = timeMillis - this._startTime;
        const deltaHours = deltaMillis / (1000 * 60 * 60);  
        return this._distOffset + deltaHours * this._config.speedKmh;
    }
}
