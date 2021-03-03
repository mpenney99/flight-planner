import { faPause, faPlay, faRedo, faStop } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { memo } from 'react';
import { Button, InputGroup } from 'react-bootstrap';
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
        <>
            <InputGroup.Append>
                <Button onClick={onPlayPause}>
                    <FontAwesomeIcon icon={playMode === PlayMode.PLAYING ? faPause : faPlay} />
                </Button>
            </InputGroup.Append>
            <InputGroup.Append>
                <Button disabled={playMode === PlayMode.STOPPED} onClick={onPlayStop}>
                    <FontAwesomeIcon icon={faStop} />
                </Button>
            </InputGroup.Append>
            <InputGroup.Append>
                <Button
                    variant={playRepeat ? 'primary' : 'outline-primary'}
                    onClick={onToggleRepeat}
                >
                    <FontAwesomeIcon icon={faRedo} />
                </Button>
            </InputGroup.Append>
        </>
    );
}

export const FlightPlaybackControls = memo(FlightPlaybackControlsInner);
