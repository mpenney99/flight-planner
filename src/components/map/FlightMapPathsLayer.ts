import MapboxDraw from '@mapbox/mapbox-gl-draw';
import chroma from 'chroma-js';
import mapboxgl from 'mapbox-gl';
import { Subject } from 'rxjs';
import { Point } from '../../types';
import { geoPositionToPoint, pointToGeoPosition } from '../../utils/geoUtils';
import { DRAW_STYLES } from './drawStyles';

export enum EventType {
    PATH_CREATED,
    PATH_SELECTED,
    PATH_UPDATED,
    PATH_DELETED
}

export type PathCreatedEvent = {
    type: EventType.PATH_CREATED;
    pathId: string;
    path: Point[];
    pathColor: string;
};

export type PathSelectedEvent = { type: EventType.PATH_SELECTED; pathId: string };

export type PathDeletedEvent = { type: EventType.PATH_DELETED; pathId: string };

export type PathUpdatedEvent = {
    type: EventType.PATH_UPDATED;
    pathId: string;
    path: Point[];
};

export type PathEvent = PathCreatedEvent | PathSelectedEvent | PathDeletedEvent | PathUpdatedEvent;

export class FlightMapPathsLayer {
    private readonly _subject: Subject<PathEvent> = new Subject();
    private readonly _paths: Map<string, Point[]> = new Map();
    private readonly _draw: MapboxDraw;

    constructor(map: mapboxgl.Map) {
        this._draw = new MapboxDraw({
            defaultMode: 'draw_line_string',
            displayControlsDefault: false,
            controls: {
                line_string: true,
                trash: true
            },
            userProperties: true,
            styles: DRAW_STYLES
        });

        map.addControl(this._draw);

        map.on('draw.create', this._onDrawCreate.bind(this));
        map.on('draw.update', this._onDrawUpdate.bind(this));
        map.on('draw.delete', this._onDrawDelete.bind(this));
        map.on('draw.selectionchange', this._onDrawSelect.bind(this));
    }

    subscribe(observer: (event: PathEvent) => void) {
        return this._subject.subscribe(observer);
    }

    selectPath(pathId: string) {
        this._draw.changeMode('direct_select', { featureId: pathId });
    }

    createOrUpdatePath(pathId: string, path: Point[]) {
        this._paths.set(pathId, path);
        const feature = this._createFeatureFromPath(pathId, path);
        this._draw.add(feature);
    }

    setPathColor(pathId: string, lineColor: string) {
        this._draw.setFeatureProperty(pathId, 'lineColor', lineColor);

        // add the feature back onto the map to force the color to update
        const feat = this._draw.get(pathId);
        if (feat) this._draw.add(feat);
    }

    removePath(pathId: string) {
        this._draw.delete(pathId);
    }

    private _onDrawCreate(event: { features: GeoJSON.Feature[] }) {
        event.features.forEach((feature) => {
            const path = this._geoGeometryToPath(feature.geometry);
            const featureId = feature.id as string;

            const pathColor = chroma.random().hex();
            this._draw.setFeatureProperty(featureId, 'lineColor', pathColor);
            this._subject.next({
                type: EventType.PATH_CREATED,
                pathId: featureId,
                path,
                pathColor
            });
        });
    }

    private _onDrawSelect(event: { features: GeoJSON.Feature[] }) {
        if (event.features.length) {
            const pathId = event.features[0].id as string;
            this._subject.next({ type: EventType.PATH_SELECTED, pathId });
        }
    }

    private _onDrawUpdate(event: { features: GeoJSON.Feature[] }) {
        event.features.forEach((feature) => {
            const pathId = feature.id as string;
            const prevPath = this._paths.get(pathId);
            const path = this._geoGeometryToPath(feature.geometry, prevPath);
            this._subject.next({ type: EventType.PATH_UPDATED, pathId, path });
        });
    }

    private _onDrawDelete(event: { features: GeoJSON.Feature[] }) {
        event.features.forEach((feature) => {
            const pathId = feature.id as string;
            this._subject.next({ type: EventType.PATH_DELETED, pathId });
        });
    }

    private _createFeatureFromPath(pathId: string, path: Point[]): GeoJSON.Feature {
        return {
            id: pathId,
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: path.map(pointToGeoPosition)
            },
            properties: {}
        };
    }

    private _geoGeometryToPath(geometry: GeoJSON.Geometry, prevPath?: Point[]): Point[] {
        if (geometry.type === 'LineString') {
            return geometry.coordinates.map((pt, i, pts) => {
                const prevAlt = prevPath && this._findPrevAltitude(prevPath, i, pts);
                return geoPositionToPoint(pt, prevAlt);
            });
        } else {
            throw new Error('unsupported geometry type');
        }
    }

    private _findPrevAltitude(prevPath: Point[], index: number, coordinates: GeoJSON.Position[]) {
        if (prevPath.length === coordinates.length) {
            // if the lengths are the same, a point was modified (not inserted or deleted). Return the previous index
            return prevPath[index].alt;
        } else {
            // Search the corresponding point by lon/lat
            const point = coordinates[index];
            return prevPath.find((prevPoint) => prevPoint.lon === point[0] && prevPoint.lat === point[1])?.alt;
        }
    }
}
