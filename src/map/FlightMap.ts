import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import mapboxgl from 'mapbox-gl';
import { Subject } from 'rxjs';
import { Point, UAS } from '../types';
import { mapbox_access_token } from '../config.json';
import { DRAW_STYLES } from './drawStyles';
import chroma from 'chroma-js';

mapboxgl.accessToken = mapbox_access_token;

export enum EventType {
    PATH_SELECTED,
    PATH_CREATED,
    PATH_UPDATED,
    PATH_DELETED
}

export type Event =
    | { type: EventType.PATH_SELECTED; featureId: string }
    | { type: EventType.PATH_CREATED; featureId: string; path: Point[], lineColor: string }
    | { type: EventType.PATH_UPDATED; featureId: string; path: Point[] }
    | { type: EventType.PATH_DELETED; featureId: string }

export class FlightMap {
    private readonly _events = new Subject<Event>();
    private readonly _uasMarkers = new Map<string, mapboxgl.Marker>();
    private readonly _paths = new Map<string, Point[]>();
    private readonly _map: mapboxgl.Map;
    private readonly _draw: MapboxDraw;
    private _selectedFlightId: string | null = null;

    constructor(container: HTMLElement) {
        const map = new mapboxgl.Map({
            container,
            // style: 'mapbox://styles/mapbox/streets-v11',
            style: 'mapbox://styles/mapbox/satellite-streets-v11',
            center: [4.402771, 51.260197],
            zoom: 9
        });

        this._map = map;

        map.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true
            })
        );

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

    get events() {
        return this._events;
    }

    selectPath(flightId: string) {
        if (this._selectedFlightId === flightId) {
            return;
        }
        this._selectedFlightId = flightId;
        this._draw.changeMode('direct_select', { featureId: flightId });
    }

    updatePath(featureId: string, path: Point[]) {
        if (this._paths.get(featureId) === path) {
            return;
        }
        const feature = this._createFeatureFromPath(featureId, path);
        this._draw.add(feature);
    }

    setPathColor(featureId: string, lineColor: string) {
        this._draw.setFeatureProperty(featureId, 'lineColor', lineColor);

        // add the feature back onto the map to force the color to update
        const feat = this._draw.get(featureId);
        if (feat) this._draw.add(feat);
    }

    removePath(featureId: string) {
        if (!this._paths.has(featureId)) {
            return;
        }
        this._draw.delete(featureId);
    }

    updateUas(id: string, uas: UAS) {
        let marker = this._uasMarkers.get(id);

        if (!marker) {
            const el = this._createMarkerElement(id);
            marker = new mapboxgl.Marker(el)
                .setLngLat(uas.position)
                .addTo(this._map);
            this._uasMarkers.set(id, marker);
        }

        marker.setLngLat(uas.position);
    }

    removeUas(id: string) {
        const marker = this._uasMarkers.get(id);
        if (!marker) {
            return;
        }

        this._uasMarkers.delete(id);
        marker.remove();
    }

    private _onDrawCreate(event: { features: GeoJSON.Feature[] }) {
        event.features.forEach((feature) => {
            const path = this._geometryToPath(feature.geometry);
            const featureId = feature.id as string;
            this._paths.set(featureId, path);

            const lineColor = chroma.random().hex();
            this._draw.setFeatureProperty(featureId, 'lineColor', lineColor);
            this._events.next({ type: EventType.PATH_CREATED, featureId, path, lineColor });
        });
    }

    private _onDrawSelect(event: { features: GeoJSON.Feature[] }) {
        if (event.features.length) {
            const featureId = event.features[0].id as string;
            this._selectedFlightId = featureId;
            this._events.next({ type: EventType.PATH_SELECTED, featureId });
        }
    }

    private _onDrawUpdate(event: { features: GeoJSON.Feature[] }) {
        event.features.forEach((feature) => {
            const featureId = feature.id as string;
            const path = this._geometryToPath(feature.geometry);
            this._paths.set(featureId, path);
            this._events.next({ type: EventType.PATH_UPDATED, featureId, path });
        });
    }

    private _onDrawDelete(event: { features: GeoJSON.Feature[] }) {
        event.features.forEach((feature) => {
            const featureId = feature.id as string;
            this._paths.delete(featureId);
            this._selectedFlightId = null;
            this._events.next({ type: EventType.PATH_DELETED, featureId });
        });
    }

    private _createMarkerElement(flightId: string) {
        const container = document.createElement('div');

        const el = document.createElement('div');
        el.className="c-uas-marker"
        el.style.backgroundImage = `url(/uas.png)`;
        el.style.width = '40px';
        el.style.height = '40px';
        el.addEventListener('click', () => {
            this._events.next({ type: EventType.PATH_SELECTED, featureId: flightId });
        });

        container.appendChild(el);
        return container;
    }

    private _geometryToPath(geometry: GeoJSON.Geometry): Point[] {
        if (geometry.type === 'LineString') {
            return geometry.coordinates.map(([lon, lat]) => [lon, lat]);
        } else {
            throw new Error('unsupported geometry type');
        }
    }

    private _createFeatureFromPath(pathId: string, path: Point[]): GeoJSON.Feature {
        return {
            id: pathId,
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: path
            },
            properties: {}
        };
    }
}
