export type Point = [lon: number, lat: number];

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
    altitude: number;
    securityGroup: string;
    vehicleType: VehicleType;
    path: Point[];
};

export type UAS = {
    position: Point;
};

export type Settings = {
    envId: string;
    updateInterval: number;
};
