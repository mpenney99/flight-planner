import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bootstrap';
import { useRecoilState } from 'recoil';
import { showSettingsAtom } from '../atoms';

export default function SidePanelHeader() {
    const [showSettings, setShowSettings] = useRecoilState(showSettingsAtom);

    const onToggleSettings = () => {
        setShowSettings(true);
    };

    return (
        <div className="d-flex align-items-center p-3">
            <Button
                className="mr-1"
                variant="outline-primary"
                disabled={showSettings}
                onClick={onToggleSettings}
            >
                <FontAwesomeIcon icon={faCog} />
            </Button>
            <h2 className="text-primary flex-grow-1 text-center mr-3">Flight Planner</h2>
        </div>
    );
}
