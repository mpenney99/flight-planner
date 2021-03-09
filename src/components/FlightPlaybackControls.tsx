import { faPause, faPlay, faRedo, faStop } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { memo } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { useRecoilState } from 'recoil';
import { flightConfigAtomFamily } from '../atoms';
import { PlayMode } from '../types';

type Props = {
    flightId: string;
};

function FlightPlaybackControlsInner({ flightId }: Props) {
    const [flightConfig, setFlightConfig] = useRecoilState(flightConfigAtomFamily(flightId));
    const { playMode, playRepeat } = flightConfig;

    const onPlayPause = () => {
        setFlightConfig((config) => ({
            ...config,
            playMode: config.playMode === PlayMode.PLAYING ? PlayMode.PAUSED : PlayMode.PLAYING
        }));
    };

    const onPlayStop = () => {
        setFlightConfig((config) => ({
            ...config,
            playMode: PlayMode.STOPPED
        }));
    };

    const onToggleRepeat = () => {
        setFlightConfig((config) => ({
            ...config,
            playRepeat: !config.playRepeat
        }));
    };

    return (
        <ButtonGroup>
            <Button onClick={onPlayPause}>
                <FontAwesomeIcon icon={playMode === PlayMode.PLAYING ? faPause : faPlay} />
            </Button>
            <Button disabled={playMode === PlayMode.STOPPED} onClick={onPlayStop}>
                <FontAwesomeIcon icon={faStop} />
            </Button>
            <Button variant={playRepeat ? 'primary' : 'outline-primary'} onClick={onToggleRepeat}>
                <FontAwesomeIcon icon={faRedo} />
            </Button>
        </ButtonGroup>
    );
}

export const FlightPlaybackControls = memo(FlightPlaybackControlsInner);
