import { useCallback, useEffect, useRef, useState } from 'react';
import { InputGroup } from 'react-bootstrap';
import { SketchPicker } from 'react-color';
import { useClickOutside } from '../../utils/hooks/useClickOutside';
import { TextInput } from './TextInput';

type Props = {
    value: string;
    onChange: (value: string) => void;
};

export function ColorInput({ value, onChange }: Props) {
    const pickerRef = useRef<HTMLDivElement>(null);
    const [showPicker, setShowPicker] = useState(false);
    const [hexColor, setHexColor] = useState(value);

    // synchronize the parent state with the current input value
    useEffect(() => {
        setHexColor(value);
    }, [value]);

    // hide the picker on click elsewhere in the document
    const handleClickOutside = useCallback(() => {
        setShowPicker(false);
    }, []);

    useClickOutside(pickerRef, handleClickOutside, showPicker);

    return (
        <InputGroup>
            <TextInput value={hexColor} onChange={onChange} />
            <InputGroup.Append>
                <InputGroup.Text>
                    <div className="c-picker">
                        <div
                            className="c-picker__toggle"
                            style={{ background: hexColor }}
                            onClick={() => setShowPicker(!showPicker)}
                        ></div>
                        <div className="c-picker__picker" ref={pickerRef}>
                            {showPicker && (
                                <SketchPicker
                                    color={hexColor}
                                    onChange={(color) => {
                                        setHexColor(color.hex);
                                    }}
                                    onChangeComplete={(color) => {
                                        onChange(color.hex);
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </InputGroup.Text>
            </InputGroup.Append>
        </InputGroup>
    );
}
