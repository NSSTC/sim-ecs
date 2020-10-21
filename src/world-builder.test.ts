import {expect} from 'chai';
import {WorldBuilder, _ as _WorldBuilder} from "./world-builder";
import {NoData, System} from "./system";

class ASystem extends System<NoData> {
    readonly SystemDataType = NoData;
    async run(dataSet: Set<NoData>): Promise<void> {}
}

describe('Test WorldBuilder', () => {
    it('Unique Systems', () => {
        const builder = new WorldBuilder();
        builder.withSystem(new ASystem());
        expect(builder.withSystem.bind(builder, new ASystem())).to.throw();
    });

    it('Default De-/Serializer', () => {
        const Component = class {
            a = 45
            b = 'foo'
            c = { d: 17 }
        };

        const component = new Component();

        component.a = 17;

        const jsonObj = JSON.stringify(component);
        const serializedObj = _WorldBuilder.dataStructSerializer(component);
        const deserializedObj = _WorldBuilder.dataStructDeserializer(Component, JSON.parse(serializedObj));

        expect(serializedObj).eq(jsonObj);
        expect(deserializedObj).deep.eq(component);
        expect(deserializedObj instanceof Component).eq(true);
    });
});
