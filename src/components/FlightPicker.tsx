import { DropdownButton } from 'react-bootstrap';
import DropdownItem from 'react-bootstrap/esm/DropdownItem';
import { useRecoilState, useRecoilValue } from 'recoil';
import { flightConfigAtomFamily, flightIdsAtom, selectedFlightIdAtom } from '../atoms';
import { FlightPlaybackControls } from './FlightPlaybackControls';

type Props = {
    flightId: string;
    onSelect: (flightId: string) => void;
};

function FlightOption({ flightId, onSelect }: Props) {
    const { lineColor } = useRecoilValue(flightConfigAtomFamily(flightId));
    return (
        <DropdownItem onClick={onSelect.bind(null, flightId)}>
            <div className="d-flex">
                <span className="text-truncate mr-2" style={{ maxWidth: 120 }}>
                    {flightId}
                </span>
                <div className="c-picker__toggle" style={{ background: lineColor }} />
            </div>
        </DropdownItem>
    );
}

export function FlightPicker() {
    const flightIds = useRecoilValue(flightIdsAtom);
    const [selectedFlightId, setSelectedFlightId] = useRecoilState(selectedFlightIdAtom);

    const onSelectFlight = (flightId: string) => {
        setSelectedFlightId(flightId);
    };

    return (
        <div className="d-flex justify-content-between">
            <DropdownButton className="mr-2" title="Selected Flight">
                {flightIds.map((flightId) => (
                    <FlightOption key={flightId} flightId={flightId} onSelect={onSelectFlight} />
                ))}
            </DropdownButton>
            {selectedFlightId && <FlightPlaybackControls flightId={selectedFlightId} />}
        </div>
    );
}
