import * as yup from 'yup';
import { persistInLocalStorageEffect } from '../atomEffects';

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

const schema = yup.object({
    foo: yup.string().required()
});

const validate = (value: any) => schema.isValidSync(value, { strict: true });

it('saves a value to localStorage', () => {
    const effect = persistInLocalStorageEffect('settings', validate);
    const onSet = createOnSetMock();

    effect({ onSet } as any);
    onSet.provide({ foo: 'bar' });

    expect(localStorage.getItem('settings')).toEqual(JSON.stringify({ foo: 'bar' }));
});

it('gets the value from localStorage', () => {
    localStorage.setItem('settings', JSON.stringify({ foo: 'bar' }));
    const effect = persistInLocalStorageEffect('settings', validate);
    const setSelf = jest.fn();
    const onSet = createOnSetMock();

    effect({ setSelf, onSet } as any);

    expect(setSelf).toHaveBeenCalledWith({ foo: 'bar' });
});

it('ignores the value from localStorage when doesnt match the schema', () => {
    localStorage.setItem('settings', JSON.stringify({ foo: 1 }));
    const effect = persistInLocalStorageEffect('settings', validate);
    const setSelf = jest.fn();
    const onSet = createOnSetMock();

    effect({ setSelf, onSet } as any);

    expect(setSelf).toHaveBeenCalledTimes(0);
});
