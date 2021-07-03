import bearing from '@turf/bearing';
import destination from '@turf/destination';
import distance from '@turf/distance';
import { Point, UASState, VehicleType } from '../types';

export const DEFAULT_ALTITUDE = 30;

export function geoPositionToPoint([lon, lat]: GeoJSON.Position, alt: number = DEFAULT_ALTITUDE): Point {
    return { lon, lat, alt };
}

export function pointToGeoPosition(pathNode: Point): GeoJSON.Position {
    return [pathNode.lon, pathNode.lat];
}

function lerp(from: number, to: number, i: number) {
    return from + (to - from) * i;
}

export function getUASStateAlongPath(distTravelled: number, path: Point[], vehicleType: VehicleType): UASState | null {
    let distRemaining = distTravelled;
    
    for (let i = 0, n = path.length - 1; i < n; i++) {
        const from = pointToGeoPosition(path[i]);
        const to = pointToGeoPosition(path[i + 1]);
        const distBetween = distance(from, to, { units: 'meters' });

        if (distRemaining <= distBetween) {
            const heading = bearing(from, to);
            const pt = destination(from, distRemaining, heading, { units: 'meters' });
            const [lon, lat] = pt.geometry.coordinates;
            const alt = lerp(path[i].alt, path[i + 1].alt, distRemaining / distBetween);

            return {
                vehicleType,
                distanceTravelled: distTravelled,
                heading,
                position: { lon, lat, alt }
            };
        }

        distRemaining -= distBetween;
    }

    // return null when we reached the end of the track
    return null;
}
