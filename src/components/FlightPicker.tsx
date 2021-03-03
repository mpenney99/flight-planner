import { FormControl, FormGroup, FormLabel, InputGroup } from 'react-bootstrap';
import { useRecoilState, useRecoilValue } from 'recoil';
import { flightIdsAtom, selectedFlightIdAtom } from '../atoms';
import { FlightPlaybackControls } from './FlightPlaybackControls';

export function FlightPicker() {
    const flightIds = useRecoilValue(flightIdsAtom);
    const [selectedFlightId, setSelectedFlightId] = useRecoilState(selectedFlightIdAtom);

    const onFlightChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const flightId = e.target.value;
        setSelectedFlightId(flightId);
    };

    return (
        <FormGroup>
            <FormLabel>Flight</FormLabel>
            <InputGroup>
                <FormControl as="select" value={selectedFlightId || ''} onChange={onFlightChanged}>
                    {flightIds.map((flightId) => (
                        <option key={flightId} value={flightId}>
                            {flightId}
                        </option>
                    ))}
                </FormControl>
                {selectedFlightId && <FlightPlaybackControls flightId={selectedFlightId} />}
            </InputGroup>
        </FormGroup>
    );
}
