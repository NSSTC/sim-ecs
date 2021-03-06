import {expect} from 'chai';
import {WorldBuilder, _ as _WorldBuilder} from "./world-builder";
import {NoData, System} from "./system";
import ECS from "./ecs";

class ASystem extends System<NoData> {
    readonly SystemDataType = NoData;
    async run(dataSet: Set<NoData>): Promise<void> {}
}

describe('Test WorldBuilder', () => {
    it('Unique Systems', () => {
        const ecs = new ECS();
        const builder = new WorldBuilder(ecs);
        builder.withSystem(ASystem);
        expect(builder.withSystem.bind(builder, ASystem)).to.throw();
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
        const deserializedObj = _WorldBuilder.dataStructDeserializer(Component, serializedObj);

        expect(JSON.stringify(serializedObj)).eq(jsonObj);
        expect(deserializedObj).deep.eq(component);
        expect(deserializedObj instanceof Component).eq(true);
    });
});
