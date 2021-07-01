import { FormControl } from 'react-bootstrap';

export type Option = string | { label: string; value: string };

type Props = {
    value: string;
    options: Option[];
    onChange: (value: string) => void;
};

export function SelectInput({ value, options, onChange }: Props) {
    return (
        <FormControl as="select" value={value} onChange={(e) => onChange(e.target.value)}>
            {options.map((option) => {
                const value = typeof option === 'string' ? option : option.value;
                const label = typeof option === 'string' ? option : option.label;
                return (
                    <option key={value} value={value}>
                        {label}
                    </option>
                );
            })}
        </FormControl>
    );
}
