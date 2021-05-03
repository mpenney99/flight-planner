import { Dropdown } from 'react-bootstrap';
import { envs, getEnvById } from '../utils/environment';

type Props = {
    value: string;
    onChanged: (envId: string) => void;
};

export function EnvSelector({ value, onChanged }: Props) {
    const selectedEnvName = getEnvById(envs, value)?.name;

    return (
        <Dropdown>
            <Dropdown.Toggle>{selectedEnvName}</Dropdown.Toggle>
            <Dropdown.Menu>
                {envs.map((env) => (
                    <Dropdown.Item key={env.id} onSelect={() => onChanged(env.id)}>
                        {env.name}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
}
