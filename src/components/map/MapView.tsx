import { useEffect, useRef, useState } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import {
    flightConfigAtomFamily,
    flightIdsAtom,
    selectedFlightIdAtom,
    uasIdsAtom
} from '../../atoms';
import { Point } from '../../types';
import { appendIfNotPresent } from '../../utils/arrayUtils';
import { AltitudeGraph } from '../altitude-profile/AltitudeGraph';
import { FlightMap } from './FlightMap';
import { EventType as PathEventType } from './FlightMapPathsLayer';
import { EventType as UASEventType } from './FlightMapUASLayer';
import { PathRenderer } from './PathRenderer';
import { UasRenderer } from './UasRenderer';

export function MapView() {
    const selectedFlightId = useRecoilValue(selectedFlightIdAtom);
    const flightIds = useRecoilValue(flightIdsAtom);
    const uasIds = useRecoilValue(uasIdsAtom);
    const containerRef = useRef<HTMLDivElement>(null);
    const [flightMap, setFlightMap] = useState<FlightMap>();

    // handle map events, update recoil state

    const onFlightPathCreated = useRecoilCallback(
        ({ set }) =>
            (featureId: string, path: Point[], lineColor: string) => {
                set(flightIdsAtom, (ids) => appendIfNotPresent(ids, featureId));
                set(flightConfigAtomFamily(featureId), (config) => ({
                    ...config,
                    path,
                    lineColor
                }));
            },
        []
    );

    const onFlightPathUpdated = useRecoilCallback(
        ({ set }) =>
            (featureId: string, path: Point[]) => {
                set(flightConfigAtomFamily(featureId), (config) => ({
                    ...config,
                    path
                }));
            },
        []
    );

    const onFlightPathDeleted = useRecoilCallback(
        ({ set, reset, snapshot }) =>
            async (featureId: string) => {
                const flightIds = await snapshot.getPromise(flightIdsAtom);
                const flightIdsFiltered = flightIds.filter((id) => id !== featureId);

                // remove the flight id
                set(flightIdsAtom, flightIdsFiltered);

                // update the current selection
                set(selectedFlightIdAtom, (id) =>
                    id === featureId ? flightIdsFiltered[flightIdsFiltered.length - 1] ?? null : id
                );

                // clear the flight state
                reset(flightConfigAtomFamily(featureId));
            },
        []
    );
    const onFlightPathSelected = useRecoilCallback(
        ({ set }) =>
            (featureId: string) => {
                set(selectedFlightIdAtom, featureId);
            },
        []
    );

    // setup event handlers
    useEffect(() => {
        const flightMap = new FlightMap(containerRef.current!);

        const pathLayerSub = flightMap.pathsLayer.subscribe((event) => {
            switch (event.type) {
                case PathEventType.PATH_CREATED:
                    onFlightPathCreated(event.pathId, event.path, event.pathColor);
                    break;
                case PathEventType.PATH_UPDATED:
                    onFlightPathUpdated(event.pathId, event.path);
                    break;
                case PathEventType.PATH_DELETED:
                    onFlightPathDeleted(event.pathId);
                    break;
                case PathEventType.PATH_SELECTED:
                    onFlightPathSelected(event.pathId);
                    break;
            }
        });

        const uasLayerSub = flightMap.uasLayer.subscribe((event) => {
            switch (event.type) {
                case UASEventType.UAS_SELECTED:
                    onFlightPathSelected(event.uasId);
                    break;
            }
        });

        setFlightMap(flightMap);

        return () => {
            pathLayerSub.unsubscribe();
            uasLayerSub.unsubscribe();
        };
    }, [onFlightPathCreated, onFlightPathDeleted, onFlightPathUpdated, onFlightPathSelected]);

    // select the path on the map
    useEffect(() => {
        if (selectedFlightId && flightMap) {
            flightMap.pathsLayer.selectPath(selectedFlightId);
        }
    }, [selectedFlightId, flightMap]);

    return (
        <>
            <div className="c-mapView">
                <div className="c-mapView__map" ref={containerRef} />
                {selectedFlightId && <AltitudeGraph flightId={selectedFlightId} />}
            </div>
            {flightMap &&
                flightIds.map((pathId) => (
                    <PathRenderer key={pathId} pathId={pathId} flightMap={flightMap} />
                ))}
            {flightMap &&
                uasIds.map((uasId) => (
                    <UasRenderer key={uasId} uasId={uasId} flightMap={flightMap} />
                ))}
        </>
    );
}
