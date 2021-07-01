import { persistInLocalStorageEffect } from '../atomEffects';

const VERSION = process.env.REACT_APP_VERSION;

const createOnSetMock = <T>() => {
    let _handler: ((value: T) => void) | undefined;

    function onSet(handler: (value: T) => void) {
        _handler = handler;
    }

    onSet.provide = (value: T) => {
        _handler?.(value);
    };

    return onSet;
};

it('saves a value to localStorage', () => {
    const effect = persistInLocalStorageEffect('settings');
    const onSet = createOnSetMock();

    effect({ onSet } as any);
    onSet.provide({ foo: 'bar' });

    expect(localStorage.getItem('settings')).toEqual(
        JSON.stringify({ version: VERSION, value: { foo: 'bar' } })
    );
});

it('gets the value from localStorage', () => {
    localStorage.setItem('settings', JSON.stringify({ version: VERSION, value: { foo: 'bar' } }));
    const effect = persistInLocalStorageEffect('settings');
    const setSelf = jest.fn();
    const onSet = createOnSetMock();

    effect({ setSelf, onSet } as any);

    expect(setSelf).toHaveBeenCalledWith({ foo: 'bar' });
});

it("doesn't get the value from localStorage when version unmatched", () => {
    localStorage.setItem('settings', JSON.stringify({ version: 'INVALID', value: { foo: 'bar' } }));
    const effect = persistInLocalStorageEffect('settings');
    const setSelf = jest.fn();
    const onSet = createOnSetMock();

    effect({ setSelf, onSet } as any);

    expect(setSelf).toHaveBeenCalledTimes(0);
});
