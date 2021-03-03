import React from 'react';
import { TextInput } from './TextInput';

type Props = {
    value: number;
    onChange: (value: number) => void;
};

export function NumberInput({ value, onChange }: Props) {
    return <TextInput type="number" value={'' + value} onChange={(v) => onChange(+v)} />;
}
