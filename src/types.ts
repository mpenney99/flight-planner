export type Point = {
    lon: number;
    lat: number;
    alt: number;
};

export enum PlayMode {
    PLAYING = 'playing',
    PAUSED = 'paused',
    STOPPED = 'stopped'
}

export enum VehicleType {
    AIRPLANE = 'AIRPLANE',
    UAS = 'UAS',
    GROUND = 'GROUND'
}

export type FlightConfig = {
    lineColor: string;
    playMode: PlayMode;
    playRepeat: boolean;
    transponderId: string;
    callSign: string;
    speedMs: number;
    securityGroup: string;
    vehicleType: VehicleType;
    path: Point[];
};

export type UASState = {
    distanceTravelled: number;
    vehicleType: VehicleType;
    heading: number;
    position: Point;
};

export type Settings = {
    envId: string;
    updateInterval: number;
};
