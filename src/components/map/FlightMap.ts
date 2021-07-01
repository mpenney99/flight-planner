import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import mapboxgl from 'mapbox-gl';
import { MapboxStyleDefinition, MapboxStyleSwitcherControl } from 'mapbox-gl-style-switcher';
import 'mapbox-gl-style-switcher/styles.css';
import { mapbox_access_token } from '../../config.json';
import { FlightMapPathsLayer } from './FlightMapPathsLayer';
import { FlightMapUASLayer } from './FlightMapUASLayer';

mapboxgl.accessToken = mapbox_access_token;

const LOCALSTORAGE_KEY_MAP_CENTER = 'map-center';
const LOCALSTORAGE_KEY_MAP_ZOOM = 'map-zoom';
const DEFAULT_ZOOM_LEVEL = 9;
const DEFAULT_CENTER_POINT = mapboxgl.LngLat.convert([4.402771, 51.260197]);

export class FlightMap {
    private readonly _map: mapboxgl.Map;
    private readonly _pathsLayer: FlightMapPathsLayer;
    private readonly _uasLayer: FlightMapUASLayer;

    constructor(container: HTMLElement) {
        const map = new mapboxgl.Map({
            container,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: this._getInitialCenter(),
            zoom: this._getInitialZoomLevel()
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

        const geocoder = new MapboxGeocoder({
            accessToken: mapbox_access_token,
            mapboxgl: this._map
        });

        map.addControl(geocoder, 'top-left');

        const styles: MapboxStyleDefinition[] = [
            { title: 'Streets', uri: 'mapbox://styles/mapbox/streets-v11' },
            { title: 'Satellite', uri: 'mapbox://styles/mapbox/satellite-streets-v11' }
        ];

        map.addControl(
            new MapboxStyleSwitcherControl(styles, {
                defaultStyle: 'Streets'
            })
        );

        map.on('zoomend', this._onViewBoundsChanged.bind(this));
        map.on('moveend', this._onViewBoundsChanged.bind(this));

        // create layers

        this._pathsLayer = new FlightMapPathsLayer(map);
        this._uasLayer = new FlightMapUASLayer(map);
    }

    get pathsLayer(): FlightMapPathsLayer {
        return this._pathsLayer;
    }

    get uasLayer(): FlightMapUASLayer {
        return this._uasLayer;
    }

    private _onViewBoundsChanged() {
        const viewCenter = this._map.getCenter();
        const viewZoom = this._map.getZoom();
        localStorage.setItem(LOCALSTORAGE_KEY_MAP_CENTER, JSON.stringify(viewCenter));
        localStorage.setItem(LOCALSTORAGE_KEY_MAP_ZOOM, JSON.stringify(viewZoom));
    }

    private _getInitialZoomLevel(): number {
        const item = localStorage.getItem(LOCALSTORAGE_KEY_MAP_ZOOM);
        if (item === null) {
            return DEFAULT_ZOOM_LEVEL;
        }
        return parseFloat(item);
    }

    private _getInitialCenter(): mapboxgl.LngLat {
        const item = localStorage.getItem(LOCALSTORAGE_KEY_MAP_CENTER);
        if (item === null) {
            return DEFAULT_CENTER_POINT;
        }
        return JSON.parse(item);
    }
}
