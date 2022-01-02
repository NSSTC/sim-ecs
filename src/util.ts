// todo: improve typing
export function arrayReplace<T extends Array<unknown>>(array: T, searchValue: unknown, replaceValue: unknown): T {
    const newArray: T = new Array(array.length) as T;

    for (let i = 0; i < array.length; i++) {
        newArray[i] = array[i] == searchValue
            ? replaceValue
            : array[i];
    }

    return newArray as T;
}
