import { Point } from '../types';

export const DEFAULT_ALTITUDE = 30;

export function geoPositionToPoint([lon, lat]: GeoJSON.Position, alt: number = DEFAULT_ALTITUDE): Point {
    return { lon, lat, alt };
}

export function pointToGeoPosition(pathNode: Point): GeoJSON.Position {
    return [pathNode.lon, pathNode.lat];
}
