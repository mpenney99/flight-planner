import { AtomEffect, DefaultValue } from 'recoil';

const VERSION = process.env.REACT_APP_VERSION;

/**
 * Persists the atom value in local-storage. Uses the package.json version to check
 * that the setting was saved with the correct app version.
 * @param key - localStorage key
 */
export const persistInLocalStorageEffect = <T>(key: string): AtomEffect<T> => {
    return ({ onSet, setSelf }) => {
        const savedValue = window.localStorage.getItem(key);
        if (savedValue != null) {
            try {
                const parsed = JSON.parse(savedValue);
                if (parsed.version === VERSION) {
                    setSelf(parsed.value);
                }
            } catch (err) {
                console.warn(`Cannot deserialize value from localStorage. Key="${key}"`);
            }
        }

        onSet((newValue) => {
            if (newValue instanceof DefaultValue) {
                window.localStorage.removeItem(key);
            } else {
                window.localStorage.setItem(
                    key,
                    JSON.stringify({ version: VERSION, value: newValue })
                );
            }
        });
    };
};
