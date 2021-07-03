import mapboxgl from 'mapbox-gl';
import { Subject } from 'rxjs';
import { UASState } from '../../types';
import { createUASMarker, updateUASMarker } from './uasPainter';

export enum EventType {
    UAS_SELECTED
}

export type UASSelectedEvent = { type: EventType.UAS_SELECTED; uasId: string };

export type UASEvent = UASSelectedEvent;

export class FlightMapUASLayer {
    private readonly _map: mapboxgl.Map;
    private readonly _subject: Subject<UASEvent>;
    private readonly _uasMarkers = new Map<string, mapboxgl.Marker>();

    constructor(map: mapboxgl.Map) {
        this._subject = new Subject();
        this._map = map;
    }

    subscribe(observer: (event: UASEvent) => void) {
        return this._subject.subscribe(observer);
    }

    createOrUpdateUAS(id: string, uas: UASState) {
        let marker = this._uasMarkers.get(id);

        if (!marker) {
            const el = this._createMarkerElement(id, uas);
            marker = new mapboxgl.Marker(el as unknown as HTMLElement).setLngLat(uas.position).addTo(this._map);
            this._uasMarkers.set(id, marker);
        } else {
            const markerEl = marker.getElement()!.firstChild as SVGSVGElement;
            updateUASMarker(markerEl, uas.vehicleType, 0, 0);
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

    private _createMarkerElement(featureId: string, uas: UASState) {
        const container = document.createElement('div');

        const svg = createUASMarker(uas.vehicleType, 0, 0);
        svg.firstChild!.addEventListener('click', () => {
            this._subject.next({ type: EventType.UAS_SELECTED, uasId: featureId });
        });

        container.appendChild(svg);
        return container;
    }
}
