import { useEffect, useRef } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { flightConfigAtomFamily, flightIdsAtom, selectedFlightIdAtom } from '../atoms';
import { FlightMap, EventType } from '../map/FlightMap';
import { Point } from '../types';
import { appendIfNotPresent } from '../utils/arrayUtils';

type Props = {
    onFlightMapCreated: (flightMap: FlightMap) => void;
};

export function MapView({ onFlightMapCreated }: Props) {
    const flightId = useRecoilValue(selectedFlightIdAtom);
    const containerRef = useRef<HTMLDivElement>(null);
    const callbackRef = useRef(onFlightMapCreated);

    // handle a new path was added to the map
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

    // handle a path was updated on the map
    const onFlightPathUpdated = useRecoilCallback(
        ({ set }) => (featureId: string, path: Point[]) => {
            set(flightConfigAtomFamily(featureId), (config) => ({
                ...config,
                path
            }));
        },
        []
    );

    // handle a path was removed from the map
    const onFlightPathDeleted = useRecoilCallback(
        ({ set, reset, snapshot }) => async (featureId: string) => {
            const flightIds = await snapshot.getPromise(flightIdsAtom);
            const flightIdsFiltered = flightIds.filter((id) => id !== featureId);

            // remove the flight id from the list
            set(flightIdsAtom, flightIdsFiltered);
            set(selectedFlightIdAtom, (id) =>
                id === featureId ? flightIdsFiltered[flightIdsFiltered.length - 1] ?? null : id
            );

            // clear the flight config
            reset(flightConfigAtomFamily(featureId));
        },
        []
    );

    // handle flight path was selected
    const onFlightPathSelected = useRecoilCallback(
        ({ set }) => (featureId: string) => {
            set(selectedFlightIdAtom, featureId);
        },
        []
    );

    const flightMapRef = useRef<FlightMap>();
    useEffect(() => {
        const flightMap = new FlightMap(containerRef.current!);
        flightMapRef.current = flightMap;

        // handle flightmap events
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

        callbackRef.current(flightMap);
    }, [onFlightPathCreated, onFlightPathDeleted, onFlightPathUpdated, onFlightPathSelected]);

    // update the selected path on the map
    useEffect(() => {
        if (flightId) {
            flightMapRef.current!.selectPath(flightId);
        }
    }, [flightId]);

    return <div className="flex-grow-1" ref={containerRef} />;
}
