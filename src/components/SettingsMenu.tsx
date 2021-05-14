import { Button, FormGroup, FormLabel, Modal } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { useRecoilState } from 'recoil';
import { settingsAtom, showSettingsAtom } from '../atoms';
import { Settings } from '../types';
import { EnvSelector } from './EnvSelector';
import { NumberInput } from './inputs/NumberInput';

export default function SettingsMenu() {
    const [show, setShow] = useRecoilState(showSettingsAtom);
    const [settings, setSettings] = useRecoilState(settingsAtom);

    const handleClose = () => {
        setShow(false);
    };

    const submitHandler = (settings: Settings) => {
        setSettings(settings);
        setShow(false);
    };

    const { control, handleSubmit } = useForm({ defaultValues: settings });

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Settings</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit(submitHandler)}>
                <Modal.Body>
                    <Controller
                        name="envId"
                        control={control}
                        render={({ field }) => (
                            <FormGroup>
                                <FormLabel>Environment</FormLabel>
                                <EnvSelector value={field.value} onChanged={field.onChange} />
                            </FormGroup>
                        )}
                    />
                    <Controller
                        name="updateInterval"
                        control={control}
                        render={({ field }) => (
                            <FormGroup>
                                <FormLabel>Update Interval (ms)</FormLabel>
                                <NumberInput value={field.value} onChange={field.onChange} />
                            </FormGroup>
                        )}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit">Confirm</Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}
