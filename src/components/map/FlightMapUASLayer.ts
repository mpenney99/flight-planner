import mapboxgl from 'mapbox-gl';
import { Subject } from 'rxjs';
import { UAS } from '../../types';

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

    createOrUpdateUAS(id: string, uas: UAS) {
        let marker = this._uasMarkers.get(id);

        if (!marker) {
            const el = this._createMarkerElement(id);
            marker = new mapboxgl.Marker(el).setLngLat(uas.position).addTo(this._map);
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

    private _createMarkerElement(featureId: string) {
        const container = document.createElement('div');

        const el = document.createElement('div');
        el.className = 'c-uas-marker';
        el.style.backgroundImage = `url(/uas.png)`;
        el.style.width = '40px';
        el.style.height = '40px';
        el.addEventListener('click', () => {
            this._subject.next({ type: EventType.UAS_SELECTED, uasId: featureId });
        });

        container.appendChild(el);
        return container;
    }
}
