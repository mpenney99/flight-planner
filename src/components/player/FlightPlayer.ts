import { Subject } from 'rxjs';
import { FlightConfig, UASState } from '../../types';
import { Env } from '../../utils/environment';
import { getUASStateAlongPath } from '../../utils/geoUtils';
import { GAClient } from './GAClient';

const MS_TO_KNOTS = 1.94384;

export enum EventType {
    UAS_CREATED,
    UAS_UPDATED,
    UAS_REMOVED,
    API_ERROR
}

export type Event =
    | { type: EventType.UAS_CREATED; uasId: string; uas: UASState }
    | { type: EventType.UAS_UPDATED; uasId: string; uas: UASState }
    | { type: EventType.UAS_REMOVED; uasId: string }
    | { type: EventType.API_ERROR; error: string };

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
        this._update();
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
                vehicleType: this._config.vehicleType,
                distanceTravelled: 0,
                heading: 0,
                position: this._config.path[0]
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
        let uasState = getUASStateAlongPath(totalDistance, this._config.path, this._config.vehicleType);

        // replay the track
        if (uasState == null && this._playRepeat) {
            this._startTime = timeMillis;
            this._distOffset = 0;
            uasState = getUASStateAlongPath(0, this._config.path, this._config.vehicleType);
        }

        if (uasState) {
            // notify observers
            this._events.next({
                type: EventType.UAS_UPDATED,
                uasId: this._uasId,
                uas: uasState
            });

            // send the API request
            this._client
                .sendTrack({
                    longitude: uasState.position.lon,
                    latitude: uasState.position.lat,
                    altitude: uasState.position.alt,
                    sequence: this._sequence++,
                    altitudeUnit: 'm',
                    altitudeReference: 'MSL',
                    heading: uasState.heading,
                    trueHeading: 0,
                    groundSpeed: this._config.speedMs * MS_TO_KNOTS,
                    source: 'uniflyJsonToFlight',
                    callSign: this._config.callSign,
                    vehicleType: this._config.vehicleType,
                    transponderId: this._config.transponderId,
                    securityGroup: this._config.securityGroup,
                    env: this._env
                })
                .then((res) => {
                    if (res.status !== 200) {
                        const error = `API Error - ${res.statusText}`;
                        this._events.next({ type: EventType.API_ERROR, error });
                    }
                })
                .catch((err) => {
                    const error = `Uncaught Error - ${err}`;
                    this._events.next({ type: EventType.API_ERROR, error });
                });
        } else {
            this.stop();
        }
    }

    private _getTotalDistanceTravelledMeters(timeMillis: number) {
        const deltaMillis = timeMillis - this._startTime;
        const deltaSeconds = deltaMillis / 1000;
        return this._distOffset + deltaSeconds * this._config.speedMs;
    }
}
