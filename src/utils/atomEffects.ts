import { AtomEffect, DefaultValue } from 'recoil';

/**
 * Persists the atom value in local-storage.
 * @param key - localStorage key
 */
export const persistInLocalStorageEffect = <T>(
    key: string,
    validator: (value: unknown) => boolean
): AtomEffect<T> => {
    return ({ onSet, setSelf }) => {
        const savedValue = window.localStorage.getItem(key);
        if (savedValue != null) {
            try {
                const parsed = JSON.parse(savedValue);
                if (validator(parsed)) {
                    setSelf(parsed);
                }
            } catch (err) {
                console.warn(`Cannot deserialize value from localStorage. Key="${key}"`);
            }
        }

        onSet((newValue) => {
            if (newValue instanceof DefaultValue) {
                window.localStorage.removeItem(key);
            } else {
                window.localStorage.setItem(key, JSON.stringify(newValue));
            }
        });
    };
};
