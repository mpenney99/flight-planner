import { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';

type Props = {
    type?: string;
    value: string;
    onChange: (value: string) => void;
};

export function TextInput({ type, value, onChange }: Props) {
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const onInputChange = (e: React.ChangeEvent<any>) => {
        setInputValue(e.target.value);
    };

    const onKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onInputBlur();
        }
    };

    const onInputBlur = () => {
        if (value !== inputValue) {
            onChange(inputValue);
        }
    };

    return (
        <Form.Control
            type={type}
            value={inputValue}
            onChange={onInputChange}
            onKeyPress={onKeyPress}
            onBlur={onInputBlur}
        />
    );
}
