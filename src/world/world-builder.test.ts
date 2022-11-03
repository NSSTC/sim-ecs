import {expect} from 'chai';
import {dataStructDeserializer, dataStructSerializer} from "./world-builder.util";
import {WorldBuilder} from "./world-builder";
import {SerDe} from "../serde";

describe('Test WorldBuilder', () => {
    const worldName = 'world1' as const;


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
        const deserializedObj = dataStructDeserializer(Component, serializedObj).data;

        expect(JSON.stringify(serializedObj)).eq(jsonObj);
        expect(deserializedObj).deep.eq(component);
        expect(deserializedObj instanceof Component).eq(true);
    });

    it('Aliases', () => {
        const worldBuilder = new WorldBuilder(new SerDe());
        const world = worldBuilder.name(worldName).build();

        // Value is set correctly
        expect(world.name).eq(worldName);
        // Ref was updated
        expect(worldBuilder.c).eq(worldBuilder.withComponent);
    });
});
