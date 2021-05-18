import distance from '@turf/distance';
import bearing from '@turf/bearing';
import destination from '@turf/destination';
import { GAClient } from './GAClient';
import { FlightConfig, Point, UAS } from '../../types';
import { Subject } from 'rxjs';
import { Env } from '../../utils/environment';

const MS_TO_KNOTS = 1.94384;

export enum EventType {
    UAS_CREATED,
    UAS_UPDATED,
    UAS_REMOVED,
    API_ERROR
}

export type Event =
    | { type: EventType.UAS_CREATED, uasId: string, uas: UAS }
    | { type: EventType.UAS_UPDATED, uasId: string, uas: UAS }
    | { type: EventType.UAS_REMOVED, uasId: string }
    | { type: EventType.API_ERROR, error: string };

export class FlightPlayer {

    private readonly _client: GAClient = new GAClient();
    private readonly _uasId: string;
    private readonly _events = new Subject<Event>();

    private _config: FlightConfig;
    private _updateInterval = 0;
    private _playRepeat = false;
    private _startTime = 0;
    private _distOffset = 0;
    private _sequence = 0;
    private _handle: any;
    private _env: Env;

    constructor(uasId: string, config: FlightConfig, env: Env) {
        this._uasId = uasId;
        this._config = config;
        this._env = env;
        this._update = this._update.bind(this);

    }

    get events() {
        return this._events;
    }

    setConfig(config: FlightConfig) {
        if (config.speedMs !== this._config.speedMs) {
            // if the speed changed while the flight is in motion, record the current
            // distance so future updates will be calculated relative to that point

            const timeMillis = new Date().getTime();
            this._distOffset = this._getTotalDistanceTravelledMeters(timeMillis);
            this._startTime = timeMillis;
        }

        this._config = config;
    }

    setEnv(env: Env) {
        this._env = env;
    }

    setPlayRepeat(playRepeat: boolean) {
        this._playRepeat = playRepeat;
    }

    setUpdateInterval(updateInterval: number) {
        this._updateInterval = updateInterval;
    }

    play() {
        this._startTime = new Date().getTime();
        this._handle = setInterval(this._update, this._updateInterval);

        if (this._distOffset !== 0) {
            // paused
            return;
        }

        // stopped
        this._sequence = 0;
        this._events.next({
            type: EventType.UAS_CREATED,
            uasId: this._uasId,
            uas: {
                position: this._config.path[0],

            }
        });
    }

    pause() {
        clearInterval(this._handle);
        this._handle = undefined;
        const timeMillis = new Date().getTime();
        this._distOffset = this._getTotalDistanceTravelledMeters(timeMillis);
    }

    stop() {
        // reset state
        clearInterval(this._handle);
        this._handle = undefined;
        this._distOffset = 0;

        // notify observers
        this._events.next({
            type: EventType.UAS_REMOVED,
            uasId: this._uasId
        });
    }

    private _update(): void {
        const timeMillis = new Date().getTime();
        const totalDistance = this._getTotalDistanceTravelledMeters(timeMillis);
        let position = this._getCurrentPosition(totalDistance);

        // replay the track
        if (position == null && this._playRepeat) {
            this._startTime = timeMillis;
            this._distOffset = 0;
            position = this._getCurrentPosition(0);
        }

        if (position) {
            const { point, heading } = position;

            // notify observers
            this._events.next({
                type: EventType.UAS_UPDATED,
                uasId: this._uasId,
                uas: {
                    position: point
                }
            });

            // send the API request
            this._client
                .sendTrack({
                    longitude: point[0],
                    latitude: point[1],
                    sequence: this._sequence++,
                    altitude: this._config.altitude,
                    altitudeUnit: 'm',
                    altitudeReference: 'MSL',
                    heading,
                    trueHeading: 0,
                    groundSpeed: this._config.speedMs * MS_TO_KNOTS,
                    source: 'uniflyJsonToFlight',
                    callSign: this._config.callSign,
                    vehicleType: 'UAS',
                    transponderId: this._config.transponderId,
                    env: this._env
                })
                .then((res) => {
                    if (res.status !== 200) {
                        const error = `API Error - ${res.statusText}`;
                        this._events.next({ type: EventType.API_ERROR, error });
                    }
                });

        } else {
            this.stop();
        }
    }

    private _getCurrentPosition(totalDistance: number): { point: Point, heading: number } | null {
        const path = this._config.path;

        // given a distance, find the corresponding position on the track
        for (let i = 0, n = path.length - 1; i < n; i++) {
            const from = path[i];
            const to = path[i + 1];
            const dist = distance(from, to, { units: 'meters' });

            if (totalDistance <= dist) {
                const heading = bearing(from, to);
                const pt = destination(from, totalDistance, heading, { units: 'meters' });
                const point = pt.geometry.coordinates as Point;

                return {
                    point,
                    heading
                }
            }

            totalDistance -= dist;
        }

        // return null, we reached the end of the track
        return null;
    }

    private _getTotalDistanceTravelledMeters(timeMillis: number) {
        const deltaMillis = timeMillis - this._startTime;
        const deltaSeconds = deltaMillis / 1000;
        return this._distOffset + deltaSeconds * this._config.speedMs;
    }
}
