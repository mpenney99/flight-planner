import { RefObject, useEffect } from 'react';

export function useClickOutside(
    ref: RefObject<HTMLElement>,
    handleClickOutside: () => void,
    enable: boolean = true
) {
    useEffect(() => {
        if (!enable) {
            return;
        }

        const onMouseUp = (e: MouseEvent) => {
            if (!ref.current!.contains(e.target as HTMLElement)) {
                handleClickOutside();
            }
        };

        document.addEventListener('mouseup', onMouseUp);
        return () => {
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, [enable, handleClickOutside, ref]);
}
