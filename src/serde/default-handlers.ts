import {TDeserializer, TSerializer} from "./serde.spec";

export const getDefaultSerializer = function (customSerializer?: TSerializer): TSerializer {
    return (component: unknown) => {
        let componentName: string = typeof component;

        switch (typeof component) {
            case 'object': {
                if (component == null) {
                    return 'null';
                }

                componentName = component.constructor.name;

                switch (component.constructor.name) {
                    case 'Date':
                        return (component as Date).getTime();
                    case 'Array':
                    case 'Object':
                        return JSON.stringify(component);
                    case 'Map':
                    case 'Set':
                        return JSON.stringify(Array.from(component as Iterable<unknown>));
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
    return (constructorName: string, data: unknown) => {
        switch (constructorName.toLowerCase()) {
            case 'array': {
                const parsedData = JSON.parse(data as string);

                if (!Array.isArray(parsedData)) {
                    throw new Error(`Cannot deserialize Array with data of type ${typeof data}! Array expected!`);
                }

                return parsedData as Array<unknown>;
            }

            case 'date': {
                if (typeof data != 'number') {
                    throw new Error(`Cannot deserialize Date with data of type ${typeof data}! Number expected!`);
                }

                return new Date(data);
            }

            case 'map': {
                if (!Array.isArray(data)) {
                    throw new Error(`Cannot deserialize Map with data of type ${typeof data}! Array of arrays expected!`);
                }

                return new Map(data as [unknown, unknown][]);
            }

            case 'number': {
                if (typeof data != 'number') {
                    throw new Error(`Cannot deserialize Number with data of type ${typeof data}! Number expected!`);
                }

                return data as number;
            }

            case 'object': {
                const parsedData = JSON.parse(data as string);

                if (typeof parsedData != 'object') {
                    throw new Error(`Cannot deserialize Object with data of type ${typeof data}! Object expected!`);
                }

                return parsedData as Object;
            }

            case 'set': {
                if (!Array.isArray(data)) {
                    throw new Error(`Cannot deserialize Set with data of type ${typeof data}! Array expected!`);
                }

                return new Set(data as Array<unknown>);
            }

            case 'string': {
                if (typeof data != 'string') {
                    throw new Error(`Cannot deserialize String with data of type ${typeof data}! String expected!`);
                }

                return data;
            }
        }

        if (!customDeserializer) {
            throw new Error(`Missing deserializer for "${constructorName}"!`);
        }

        return customDeserializer(constructorName, data);
    }
};
