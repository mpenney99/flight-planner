export function appendIfNotPresent<T>(arr: T[], item: T) {
    return arr.indexOf(item) >= 0 ? arr : arr.concat([item]);
}
