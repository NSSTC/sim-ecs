import type {TObjectProto} from "../_.spec.ts";
import type {IDeserializerOutput} from "../serde/serde.spec.ts";

// todo: read the Constructor parameters in order to throw early if a field is missing
export function dataStructDeserializer(Constructor: TObjectProto, data: unknown): IDeserializerOutput {
    if (typeof data != 'object') {
        throw new Error(`Cannot default-deserialize ${Constructor.name}, because the data is of type ${typeof data}!`);
    }

    const obj: { [key: string]: any } = new Constructor();

    for (const kv of Object.entries(data as object)) {
        obj[kv[0]] = kv[1];
    }

    return {
        containsRefs: false,
        data: obj,
        type: Constructor,
    };
}

export function dataStructSerializer(component: unknown): unknown {
    return component;
}
