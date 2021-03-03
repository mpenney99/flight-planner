import { createContext, useContext } from 'react';
import { FlightMap } from './map/FlightMap';

export const flightMapContext = createContext<FlightMap | null>(null);

export function useFlightMap(): FlightMap | null {
    return useContext(flightMapContext);
}
