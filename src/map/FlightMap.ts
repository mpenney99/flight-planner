import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import mapboxgl from 'mapbox-gl';
import { Subject } from 'rxjs';
import { Point, UAS } from '../types';
import { mapbox_access_token } from '../config.json';

mapboxgl.accessToken = mapbox_access_token;

export enum EventType {
    FLIGHT_SELECTED,
    FLIGHT_PATH_CREATED,
    FLIGHT_PATH_UPDATED,
    FLIGHT_PATH_DELETED,
    UAS_SELECTED,
}

export type Event =
    | { type: EventType.FLIGHT_SELECTED; flightId: string }
    | { type: EventType.FLIGHT_PATH_CREATED; flightId: string; path: Point[] }
    | { type: EventType.FLIGHT_PATH_UPDATED; flightId: string; path: Point[] }
    | { type: EventType.FLIGHT_PATH_DELETED; flightId: string }

export class FlightMap {
    private readonly _events = new Subject<Event>();
    private readonly _uasMarkers = new Map<string, mapboxgl.Marker>();
    private readonly _flightPaths = new Map<string, Point[]>();

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
            }
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

    updatePath(flightId: string, path: Point[]) {
        if (this._flightPaths.get(flightId) === path) {
            return;
        }
        const feature = this._createFeatureFromPath(flightId, path);
        this._draw.add(feature);
    }

    removePath(flightId: string) {
        if (!this._flightPaths.has(flightId)) {
            return;
        }
        this._draw.delete(flightId);
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
            const flightId = feature.id as string;
            this._flightPaths.set(flightId, path);
            this._events.next({ type: EventType.FLIGHT_PATH_CREATED, flightId, path });
        });
    }

    private _onDrawSelect(event: { features: GeoJSON.Feature[] }) {
        if (event.features.length) {
            const flightId = event.features[0].id as string;
            this._selectedFlightId = flightId;
            this._events.next({ type: EventType.FLIGHT_SELECTED, flightId });
        }
    }

    private _onDrawUpdate(event: { features: GeoJSON.Feature[] }) {
        event.features.forEach((feature) => {
            const flightId = feature.id as string;
            const path = this._geometryToPath(feature.geometry);
            this._flightPaths.set(flightId, path);
            this._events.next({ type: EventType.FLIGHT_PATH_UPDATED, flightId, path });
        });
    }

    private _onDrawDelete(event: { features: GeoJSON.Feature[] }) {
        event.features.forEach((feature) => {
            const flightId = feature.id as string;
            this._flightPaths.delete(flightId);
            this._selectedFlightId = null;
            this._events.next({ type: EventType.FLIGHT_PATH_DELETED, flightId });
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
            this._events.next({ type: EventType.FLIGHT_SELECTED, flightId });
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
