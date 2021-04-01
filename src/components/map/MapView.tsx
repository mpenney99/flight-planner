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
import { FlightMap, EventType } from './FlightMap';
import { FlightPathRenderer } from './FlightPathRenderer';
import { UasRenderer } from './UasRenderer';

export function MapView() {
    const selectedFlightId = useRecoilValue(selectedFlightIdAtom);
    const flightIds = useRecoilValue(flightIdsAtom);
    const uasIds = useRecoilValue(uasIdsAtom);
    const containerRef = useRef<HTMLDivElement>(null);
    const [flightMap, setFlightMap] = useState<FlightMap>();

    // handle map events, update recoil state

    const onFlightPathCreated = useRecoilCallback(
        ({ set }) => (featureId: string, path: Point[], lineColor: string) => {
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
        ({ set }) => (featureId: string, path: Point[]) => {
            set(flightConfigAtomFamily(featureId), (config) => ({
                ...config,
                path
            }));
        },
        []
    );

    const onFlightPathDeleted = useRecoilCallback(
        ({ set, reset, snapshot }) => async (featureId: string) => {
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
        ({ set }) => (featureId: string) => {
            set(selectedFlightIdAtom, featureId);
        },
        []
    );

    useEffect(() => {
        const flightMap = new FlightMap(containerRef.current!);

        flightMap.events.subscribe((event) => {
            switch (event.type) {
                case EventType.PATH_CREATED:
                    onFlightPathCreated(event.featureId, event.path, event.lineColor);
                    break;
                case EventType.PATH_UPDATED:
                    onFlightPathUpdated(event.featureId, event.path);
                    break;
                case EventType.PATH_DELETED:
                    onFlightPathDeleted(event.featureId);
                    break;
                case EventType.PATH_SELECTED:
                    onFlightPathSelected(event.featureId);
                    break;
            }
        });

        setFlightMap(flightMap);
    }, [onFlightPathCreated, onFlightPathDeleted, onFlightPathUpdated, onFlightPathSelected]);

    // update the selected path on the map
    useEffect(() => {
        if (selectedFlightId && flightMap) {
            flightMap.selectPath(selectedFlightId);
        }
    }, [selectedFlightId, flightMap]);

    return (
        <>
            <div className="flex-grow-1" ref={containerRef} />
            {flightMap &&
                flightIds.map((flightId) => (
                    <FlightPathRenderer key={flightId} flightId={flightId} flightMap={flightMap} />
                ))}
            {flightMap &&
                uasIds.map((uasId) => (
                    <UasRenderer key={uasId} uasId={uasId} flightMap={flightMap} />
                ))}
        </>
    );
}
