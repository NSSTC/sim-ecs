import {expect} from 'chai';
import {dataStructDeserializer, dataStructSerializer} from "./world-builder.util";
import {WorldBuilder} from "./world-builder";
import {SerDe} from "../serde/serde";
import {Entity, IEntity} from "../entity/entity";
import {SerialFormat} from "../serde/serial-format";

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

    it('Default De-/Serialize non-empty object component with methods', () => {
        const entity1 = new Entity();

        class AComponent {
            constructor(
                private _foo = 1,
                public bar = 'baz',
            ) {}

            get foo() {
                return this._foo / 100;
            }

            set foo(val: number) {
                this._foo = val * 100;
            }

            public getInternalFoo() {
                return this._foo;
            }
        }

        entity1.addComponent(new AComponent());

        {
            const serde = new SerDe();
            const serdeOptions = {
                useDefaultHandler: false,
                useRegisteredHandlers: true,
            };

            serde.registerTypeHandler(
                AComponent,
                dataStructDeserializer.bind(undefined, AComponent),
                dataStructSerializer
            );

            const serial = serde.serialize({
                entities: [entity1].values(),
                resources: {},
            }, serdeOptions).toJSON();
            const deserialized = serde.deserialize(SerialFormat.fromJSON(serial), serdeOptions);
            const deserializedEntity1 = deserialized.entities.next().value as IEntity | null;
            const deserializedAComponent = deserializedEntity1?.getComponent(AComponent);

            expect(deserializedAComponent instanceof AComponent).eq(true);
            // The setter isn't invoked when deserializing the object
            expect(deserializedAComponent!.getInternalFoo()).eq(1);
            // However the getter is, here!
            expect(deserializedAComponent!.foo).eq(0.01);
        }
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
