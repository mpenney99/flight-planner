import React, { useCallback } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { useRecoilState } from 'recoil';
import { flightConfigAtomFamily } from '../atoms';
import { Point } from '../types';
import { NumberInput } from './inputs/NumberInput';
import { PathNodeInput } from './inputs/PathNodeInput';
import { TextInput } from './inputs/TextInput';

type Props = {
    flightId: string;
};

export function FlightDetails({ flightId }: Props) {
    const [flightConfig, setFlightConfig] = useRecoilState(flightConfigAtomFamily(flightId));

    const onTransponderIdChanged = (transponderId: string) => {
        setFlightConfig((config) => ({ ...config, transponderId }));
    };

    const onCallSignChanged = (callSign: string) => {
        setFlightConfig((config) => ({ ...config, callSign }));
    };

    const onSpeedChanged = (speedKmh: number) => {
        setFlightConfig((config) => ({ ...config, speedKmh }));
    };

    const onAltitudeChanged = (altitudeKm: number) => {
        setFlightConfig((config) => ({ ...config, altitudeKm }));
    };

    const onPathNodeChanged = useCallback(
        (index: number, pathNode: Point) => {
            setFlightConfig((config) => {
                const path = config.path.slice();
                path[index] = pathNode;
                return { ...config, path };
            });
        },
        [setFlightConfig]
    );

    const onPathNodeRemoved = useCallback(
        (index: number) => {
            setFlightConfig((config) => {
                const path = config.path.slice();
                path.splice(index, 1);
                return { ...config, path };
            });
        },
        [setFlightConfig]
    );

    return (
        <div className="pt-4 border-top">
            <Form.Group>
                <Form.Label>Transponder Id</Form.Label>
                <TextInput value={flightConfig.transponderId} onChange={onTransponderIdChanged} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Call-sign</Form.Label>
                <TextInput value={flightConfig.callSign} onChange={onCallSignChanged} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Altitude</Form.Label>
                <InputGroup>
                    <NumberInput value={flightConfig.altitudeKm} onChange={onAltitudeChanged} />
                    <InputGroup.Append>
                        <InputGroup.Text>km</InputGroup.Text>
                    </InputGroup.Append>
                </InputGroup>
            </Form.Group>
            <Form.Group>
                <Form.Label>Speed</Form.Label>
                <InputGroup>
                    <NumberInput value={flightConfig.speedKmh} onChange={onSpeedChanged} />
                    <InputGroup.Append>
                        <InputGroup.Text>km/h</InputGroup.Text>
                    </InputGroup.Append>
                </InputGroup>
            </Form.Group>
            <Form.Group>
                {flightConfig.path.map((pathNode, i, arr) => (
                    <PathNodeInput
                        key={i}
                        index={i}
                        value={pathNode}
                        onChange={onPathNodeChanged}
                        onRemove={onPathNodeRemoved}
                        removeDisabled={arr.length <= 2}
                    />
                ))}
            </Form.Group>
        </div>
    );
}
