import { Dropdown } from 'react-bootstrap';
import { useRecoilState } from 'recoil';
import { selectedEnvAtom } from '../atoms';
import { envs, getEnvById } from '../utils/environment';

export function EnvSelector() {
    const [selectedEnvId, setSelectedEnvId] = useRecoilState(selectedEnvAtom);
    const selectedEnvName = getEnvById(envs, selectedEnvId);

    return (
        <Dropdown>
            <Dropdown.Toggle block>{selectedEnvName}</Dropdown.Toggle>
            <Dropdown.Menu>
                {envs.map((env) => (
                    <Dropdown.Item key={env.id} onSelect={() => setSelectedEnvId(env.id)}>
                        {env.name}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
}
