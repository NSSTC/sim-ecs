import type {TDeserializer, TSerializer} from "./serde.spec";
import {Entity} from "../entity";
import {Reference} from "./referencing";
import {EReferenceType} from "./referencing.spec";


export const getDefaultSerializer = function (customSerializer?: TSerializer): TSerializer {
    const serializeObjectReplacer = function (key: string, value: Object): string | Object {
        return value instanceof Entity
            ? new Reference(EReferenceType.Entity, value.id).toString()
            : value;
    };

    return (component: unknown) => {
        let componentName: string = typeof component;

        switch (typeof component) {
            case 'object': {
                if (component == null) {
                    return 'null';
                }

                componentName = component.constructor.name;

                switch (componentName) {
                    case 'Date':
                        return (component as Date).getTime();
                    case 'Array':
                    case 'Object':
                        return JSON.stringify(component, serializeObjectReplacer);
                    case 'Map':
                    case 'Set':
                        return JSON.stringify(Array.from(component as Iterable<unknown>), serializeObjectReplacer);
                }

                break;
            }

            case "string": {
                return JSON.stringify(component);
            }
        }

        if (!customSerializer) {
            throw new Error(`Missing serializer for "${componentName}"!`);
        }

        return customSerializer(component);
    };
}

export const getDefaultDeserializer = function (customDeserializer?: TDeserializer): TDeserializer {
    const serializeObjectReviver = (inOut: {containsRefs: boolean} = {containsRefs: false}, key: string, value: any) =>
        typeof value == 'string' && Reference.isReferenceString(value)
            ? (inOut.containsRefs = true, Reference.fromString(value))
            : value;

    return (constructorName: string, data: unknown) => {
        switch (constructorName.toLowerCase()) {
            case 'array': {
                const inOut = {containsRefs: false};
                const parsedData = JSON.parse(data as string, serializeObjectReviver.bind(undefined, inOut));

                if (!Array.isArray(parsedData)) {
                    throw new Error(`Cannot deserialize Array with data of type ${typeof data}! Array expected!`);
                }

                return {
                    containsRefs: inOut.containsRefs,
                    data: parsedData as Array<unknown>,
                };
            }

            case 'date': {
                if (typeof data != 'number') {
                    throw new Error(`Cannot deserialize Date with data of type ${typeof data}! Number expected!`);
                }

                return {
                    containsRefs: false,
                    data: new Date(data),
                };
            }

            case 'map': {
                if (!Array.isArray(data)) {
                    throw new Error(`Cannot deserialize Map with data of type ${typeof data}! Array of arrays expected!`);
                }

                const inOut = {containsRefs: false};

                {
                    let row;
                    for (row of data) {
                        row[1] = serializeObjectReviver(inOut, row[0], row[1]);
                    }
                }

                return {
                    containsRefs: inOut.containsRefs,
                    data: new Map(data as [unknown, unknown][]),
                };
            }

            case 'number': {
                if (typeof data != 'number') {
                    throw new Error(`Cannot deserialize Number with data of type ${typeof data}! Number expected!`);
                }

                return {
                    containsRefs: false,
                    data: data as number,
                };
            }

            case 'object': {
                const inOut = {containsRefs: false};
                const parsedData = JSON.parse(data as string, serializeObjectReviver.bind(undefined, inOut));

                if (typeof parsedData != 'object') {
                    throw new Error(`Cannot deserialize Object with data of type ${typeof data}! Object expected!`);
                }

                return {
                    containsRefs: inOut.containsRefs,
                    data: parsedData as Object,
                };
            }

            case 'set': {
                if (!Array.isArray(data)) {
                    throw new Error(`Cannot deserialize Set with data of type ${typeof data}! Array expected!`);
                }

                const inOut = {containsRefs: false};

                {
                    const NO_KEY = '';
                    for (let i = 0; i < data.length; i++) {
                        data[i] = serializeObjectReviver(inOut, NO_KEY, data[i]);
                    }
                }

                return {
                    containsRefs: inOut.containsRefs,
                    data: new Set(data as Array<unknown>),
                };
            }

            case 'string': {
                if (typeof data != 'string') {
                    throw new Error(`Cannot deserialize String with data of type ${typeof data}! String expected!`);
                }

                return {
                    containsRefs: false,
                    data,
                };
            }
        }

        if (!customDeserializer) {
            throw new Error(`Missing deserializer for "${constructorName}"!`);
        }

        return customDeserializer(constructorName, data);
    }
};
