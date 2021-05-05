import { TextInput } from './TextInput';

type Props = {
    value: number;
    decimalPlaces?: number;
    onChange: (value: number) => void;
};

export function NumberInput({ value, decimalPlaces, onChange }: Props) {
    const valueRounded = decimalPlaces != null ? value.toFixed(decimalPlaces) : '' + value;
    return <TextInput type="number" value={valueRounded} onChange={(v) => onChange(+v)} />;
}
