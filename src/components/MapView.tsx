import { useEffect, useRef } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { flightConfigAtomFamily, flightIdsAtom, selectedFlightIdAtom } from '../atoms';
import { FlightMap, EventType } from '../map/FlightMap';
import { Point } from '../types';

type Props = {
    onFlightMapCreated: (flightMap: FlightMap) => void;
};

export function MapView({ onFlightMapCreated }: Props) {
    const flightId = useRecoilValue(selectedFlightIdAtom);
    const containerRef = useRef<HTMLDivElement>(null);
    const callbackRef = useRef(onFlightMapCreated);

    const onFlightPathUpdated = useRecoilCallback(
        ({ set }) => (flightId: string, path: Point[]) => {
            set(flightIdsAtom, (flightIds) =>
                flightIds.indexOf(flightId) < 0 ? flightIds.concat([flightId]) : flightIds
            );
            set(flightConfigAtomFamily(flightId), (config) => ({
                ...config,
                path
            }));
        },
        []
    );

    const onFlightPathDeleted = useRecoilCallback(
        ({ set, reset, snapshot }) => async (flightId: string) => {
            const flightIds = await snapshot.getPromise(flightIdsAtom);
            const flightIdsFiltered = flightIds.filter((id) => id !== flightId);

            set(flightIdsAtom, flightIdsFiltered);

            set(selectedFlightIdAtom, (id) => {
                if (id === flightId) {
                    return flightIdsFiltered.length
                        ? flightIdsFiltered[flightIdsFiltered.length - 1]
                        : null;
                }
                return id;
            });

            reset(flightConfigAtomFamily(flightId));
        },
        []
    );

    const onFlightSelected = useRecoilCallback(
        ({ set }) => (flightId: string) => {
            set(selectedFlightIdAtom, flightId);
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
                case EventType.FLIGHT_PATH_CREATED:
                case EventType.FLIGHT_PATH_UPDATED:
                    onFlightPathUpdated(event.flightId, event.path);
                    break;
                case EventType.FLIGHT_PATH_DELETED:
                    onFlightPathDeleted(event.flightId);
                    break;
                case EventType.FLIGHT_SELECTED:
                    onFlightSelected(event.flightId);
                    break;
            }
        });

        callbackRef.current(flightMap);
    }, [onFlightPathDeleted, onFlightPathUpdated, onFlightSelected]);

    useEffect(() => {
        if (flightId) {
            flightMapRef.current!.selectPath(flightId);
        }
    }, [flightId]);

    return <div className="flex-grow-1" ref={containerRef} />;
}
