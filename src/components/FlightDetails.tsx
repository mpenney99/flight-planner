import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { useRecoilState } from 'recoil';
import { flightConfigAtomFamily } from '../atoms';
import { Point } from '../types';
import { FlightPicker } from './FlightPicker';
import { ColorInput } from './inputs/ColorInput';
import { NumberInput } from './inputs/NumberInput';
import { PathNodeInput } from './inputs/PathNodeInput';
import { TextInput } from './inputs/TextInput';

type Props = {
    flightId: string;
};

export function FlightDetails({ flightId }: Props) {
    const [flightConfig, setFlightConfig] = useRecoilState(flightConfigAtomFamily(flightId));

    const onLineColorChanged = (lineColor: string) => {
        setFlightConfig((config) => ({ ...config, lineColor }));
    };

    const onTransponderIdChanged = (transponderId: string) => {
        setFlightConfig((config) => ({ ...config, transponderId }));
    };

    const onCallSignChanged = (callSign: string) => {
        setFlightConfig((config) => ({ ...config, callSign }));
    };

    const onSpeedChanged = (speedMs: number) => {
        setFlightConfig((config) => ({ ...config, speedMs }));
    };

    const onAltitudeChanged = (altitudeKm: number) => {
        setFlightConfig((config) => ({ ...config, altitude: altitudeKm }));
    };

    const onSecurityGroupChanged = (securityGroup: string) => {
        setFlightConfig((config) => ({ ...config, securityGroup }));
    };

    const onAddPathNode = () => {
        setFlightConfig((config) => ({
            ...config,
            path: config.path.concat([config.path[config.path.length - 1]])
        }));
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
        <>
            <FlightPicker />
            <div className="flex-grow-1 p-3 overflow-auto">
                <Form.Group>
                    <Form.Label>Line Colour</Form.Label>
                    <ColorInput value={flightConfig.lineColor} onChange={onLineColorChanged} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Transponder Id</Form.Label>
                    <TextInput
                        value={flightConfig.transponderId}
                        onChange={onTransponderIdChanged}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Call-sign</Form.Label>
                    <TextInput value={flightConfig.callSign} onChange={onCallSignChanged} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Altitude</Form.Label>
                    <InputGroup>
                        <NumberInput value={flightConfig.altitude} onChange={onAltitudeChanged} />
                        <InputGroup.Append>
                            <InputGroup.Text>m</InputGroup.Text>
                        </InputGroup.Append>
                    </InputGroup>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Speed</Form.Label>
                    <InputGroup>
                        <NumberInput value={flightConfig.speedMs} onChange={onSpeedChanged} />
                        <InputGroup.Append>
                            <InputGroup.Text>m/s</InputGroup.Text>
                        </InputGroup.Append>
                    </InputGroup>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Security Group</Form.Label>
                    <TextInput value={flightConfig.securityGroup} onChange={onSecurityGroupChanged} />
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
                    <Button onClick={onAddPathNode}>
                        <FontAwesomeIcon icon={faPlus} />
                    </Button>
                </Form.Group>
            </div>
        </>
    );
}
