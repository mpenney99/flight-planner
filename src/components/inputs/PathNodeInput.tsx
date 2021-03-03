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

function PathNodeInputInner({ index, value, removeDisabled, onChange, onRemove }: Props) {
    const onLonChanged = (lon: number) => {
        onChange(index, [lon, value[1]]);
    };

    const onLatChanged = (lat: number) => {
        onChange(index, [value[0], lat]);
    };

    return (
        <div className="d-flex align-items-end mb-2">
            <div className="flex-grow mr-2">
                {index === 0 ? <FormLabel>Lon</FormLabel> : undefined}
                <NumberInput value={value[0]} onChange={onLonChanged} />
            </div>
            <div className="flex-grow mr-2">
                {index === 0 ? <FormLabel>Lat</FormLabel> : undefined}
                <NumberInput value={value[1]} onChange={onLatChanged} />
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
