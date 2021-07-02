import { RefObject, useLayoutEffect, useRef } from 'react';
import { Point } from '../../types';

const CONTAINER_MARGIN = 10;

type Props = {
    containerRef: RefObject<HTMLElement>;
    xPos: number;
    yPos: number;
    point: Point;
};

export function Tooltip({ xPos, yPos, point, containerRef }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const el = ref.current;
        const container = containerRef.current;
        if (!el || !container) {
            return;
        }

        const bounds = el.getBoundingClientRect();
        const containerBounds = container.getBoundingClientRect();
        
        const left = Math.max(CONTAINER_MARGIN, Math.min(containerBounds.width - (bounds.width + CONTAINER_MARGIN), xPos + 5));
        el.style.setProperty('left', left + 'px');

        const top = Math.max(CONTAINER_MARGIN, Math.min(containerBounds.height - (bounds.height + CONTAINER_MARGIN), yPos + 5));
        el.style.setProperty('top', top + 'px');
    }, [xPos, yPos, containerRef]);

    return (
        <div ref={ref} className="c-tooltip">
            <div className="c-tooltip__field">
                <div className="c-tooltip__fieldLabel">Alt</div>
                {point.alt}
            </div>
            <div className="c-tooltip__field">
                <div className="c-tooltip__fieldLabel">Lon</div>
                {point.lon}
            </div>
            <div className="c-tooltip__field">
                <div className="c-tooltip__fieldLabel">Lat</div>
                {point.lat}
            </div>
        </div>
    );
}
