import {expect} from 'chai';
import {type ISerDeOptions, SerDe} from "./serde";
import {Entity, type IEntity} from "../entity/entity";
import {SerialFormat} from "./serial-format";
import {clearRegistry} from "../ecs/ecs-entity";
import {dataStructDeserializer, dataStructSerializer} from "../world/world-builder.util";

describe('Test SerDe', () => {
    const compare = (entity1: IEntity, entity2: IEntity | undefined) => {
        {
            // Make sure they indeed are of the correct type
            expect(entity1 instanceof Entity).eq(true);
            expect(entity2 instanceof Entity).eq(true);
        }

        {
            // Compare tags
            const entity1Tags = Array.from(entity1.getTags());
            const entity2Tags = Array.from(entity2!.getTags());

            expect(entity1Tags.length).eq(entity2Tags.length);
            expect(entity1Tags[0]).eq(entity2Tags[0]);
        }

        {
            // Make sure they have the same components and values
            expect(Object.entries(Array.from(entity1.getComponents())).toString()).eq(Object.entries(Array.from(entity2!.getComponents())).toString());
        }
    };
    const doSerDe = (entity1: IEntity, resources: Record<string, object> = {}, serdeOptions?: ISerDeOptions<never>) => {
        const serial = serde.serialize({
            entities: [entity1].values(),
            resources,
        }, serdeOptions ?? options).toJSON();
        return serde.deserialize(SerialFormat.fromJSON(serial), serdeOptions ?? options);
    };
    const doSerDeFirstEntity = (entity1: IEntity) => doSerDe(entity1).entities.next().value;
    const serde = new SerDe();
    const options = {
        useDefaultHandler: true,
        useRegisteredHandlers: false,
    };

    afterEach(() => {
        clearRegistry();
    });


    it('DEFAULT HANDLERS: serialize -> deserialize empty entity', () => {
        const entity1 = new Entity();
        compare(entity1, doSerDeFirstEntity(entity1));
    });

    it('DEFAULT HANDLERS: serialize -> deserialize empty Object component', () => {
        const entity1 = new Entity();

        entity1.addComponent({});

        compare(entity1, doSerDeFirstEntity(entity1));
    });

    it('DEFAULT HANDLERS: serialize -> deserialize non-empty Object component', () => {
        const entity1 = new Entity();

        entity1.addComponent({
            foo: 1,
            bar: 'baz',
        });

        compare(entity1, doSerDeFirstEntity(entity1));
    });

    it('DEFAULT HANDLERS: serialize -> deserialize Entity references', () => {
        const entity1 = new Entity();
        const component = { entity1 };

        entity1.addComponent(component);

        {
            const entity2 = doSerDeFirstEntity(entity1);
            compare(entity1, entity2);

            expect(entity1.getComponents().next().value.entity1.id).eq(entity2.getComponents().next().value.entity1.id);
            expect(entity1.id).eq(entity2.id);
        }
    });

    it('DEFAULT HANDLERS: serialize -> deserialize Tag', () => {
        const entity1 = new Entity();

        entity1.addTag('test');

        compare(entity1, doSerDeFirstEntity(entity1));
    });

    it('DEFAULT HANDLERS: serialize -> deserialize Resources', () => {
        serde.registerTypeHandler(ResourceA, dataStructDeserializer.bind(undefined, ResourceA), dataStructSerializer);

        const out = doSerDe(new Entity(), {
            resA: new ResourceA(),
        }, {
            useDefaultHandler: true,
            useRegisteredHandlers: true,
        });

        const res2 = out.resources[ResourceA.name] as ResourceA | undefined;

        expect(res2).not.eq(undefined);
        expect(res2!.foo).eq(42);

        serde.unregisterTypeHandler(ResourceA);
    });
});


class ResourceA {
    foo = 42;
}
