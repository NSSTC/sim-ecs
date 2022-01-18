import {expect} from 'chai';
import {dataStructDeserializer, dataStructSerializer} from "./world-builder.util";

describe('Test WorldBuilder', () => {
    it('Default De-/Serializer', () => {
        const Component = class {
            a = 45
            b = 'foo'
            c = { d: 17 }
        };

        const component = new Component();

        component.a = 17;

        const jsonObj = JSON.stringify(component);
        const serializedObj = dataStructSerializer(component);
        const deserializedObj = dataStructDeserializer(Component, serializedObj);

        expect(JSON.stringify(serializedObj)).eq(jsonObj);
        expect(deserializedObj).deep.eq(component);
        expect(deserializedObj instanceof Component).eq(true);
    });
});
