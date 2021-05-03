export type Point = [lon: number, lat: number];

export enum PlayMode {
    PLAYING = 'playing',
    PAUSED = 'paused',
    STOPPED = 'stopped'
}

export type FlightConfig = {
    lineColor: string;
    playMode: PlayMode;
    playRepeat: boolean;
    transponderId: string;
    callSign: string;
    speedMs: number;
    altitude: number;
    path: Point[];
};

export type UAS = {
    position: Point;
};

export type Settings = {
    envId: string;
};
