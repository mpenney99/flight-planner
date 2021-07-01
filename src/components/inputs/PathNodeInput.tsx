import { memo } from 'react';
import { CloseButton, FormLabel } from 'react-bootstrap';
import { Point } from '../../types';
import { NumberInput } from './NumberInput';

type Props = {
    index: number;
    value: Point;
    removeDisabled: boolean;
    onChange: (index: number, value: Point) => void;
    onRemove: (index: number) => void;
};

const DECIMAL_DEGREES_DP = 8;
const ALTITUDE_DP = 2;

function PathNodeInputInner({ index, value, removeDisabled, onChange, onRemove }: Props) {
    const onLonChanged = (lon: number) => {
        onChange(index, { ...value, lon });
    };

    const onLatChanged = (lat: number) => {
        onChange(index, { ...value, lat });
    };

    const onAltChanged = (alt: number) => {
        onChange(index, { ...value, alt });
    };

    return (
        <div className="d-flex align-items-end mb-2">
            <div className="flex-grow mr-2">
                {index === 0 ? <FormLabel>Lon</FormLabel> : undefined}
                <NumberInput
                    value={value.lon}
                    decimalPlaces={DECIMAL_DEGREES_DP}
                    onChange={onLonChanged}
                />
            </div>
            <div className="flex-grow mr-2">
                {index === 0 ? <FormLabel>Lat</FormLabel> : undefined}
                <NumberInput
                    value={value.lat}
                    decimalPlaces={DECIMAL_DEGREES_DP}
                    onChange={onLatChanged}
                />
            </div>
            <div className="flex-grow mr-2">
                {index === 0 ? <FormLabel>Alt</FormLabel> : undefined}
                <NumberInput
                    value={value.alt}
                    decimalPlaces={ALTITUDE_DP}
                    onChange={onAltChanged}
                />
            </div>
            <div className="mb-2">
                <CloseButton
                    className={removeDisabled ? 'u-visibility-hidden' : ''}
                    onClick={() => onRemove(index)}
                />
            </div>
        </div>
    );
}

export const PathNodeInput = memo(PathNodeInputInner);
