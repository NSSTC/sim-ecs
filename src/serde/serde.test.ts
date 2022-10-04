import {expect} from 'chai';
import {SerDe} from "./serde";
import {Entity, IEntity} from "../entity";
import {SerialFormat} from "./serial-format";
import {cleanRegistry} from "../ecs/ecs-entity";

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
    const doSerDe = (entity1: IEntity) => {
        const serial = serde.serialize({entities: [entity1].values()}, options).toJSON();
        return serde.deserialize(SerialFormat.fromJSON(serial), options).entities.next().value;
    };
    const serde = new SerDe();
    const options = {
        useDefaultHandler: true,
        useRegisteredHandlers: false,
    };

    afterEach(() => {
        cleanRegistry();
    });


    it('DEFAULT HANDLERS: serialize -> deserialize empty entity', () => {
        const entity1 = new Entity();
        compare(entity1, doSerDe(entity1));
    });

    it('DEFAULT HANDLERS: serialize -> deserialize Array component', () => {
        const entity1 = new Entity();

        entity1.addComponent([42, 17, 1337, 20.365]);

        {
            const entity2 = doSerDe(entity1);

            compare(entity1, entity2);
            expect(entity1.getComponent(Array)?.pop()).eq(entity2!.getComponent(Array)?.pop()).not.eq(undefined);
        }
    });

    it('DEFAULT HANDLERS: serialize -> deserialize empty Object component', () => {
        const entity1 = new Entity();

        entity1.addComponent({});

        compare(entity1, doSerDe(entity1));
    });

    it('DEFAULT HANDLERS: serialize -> deserialize non-empty Object component', () => {
        const entity1 = new Entity();

        entity1.addComponent({
            foo: 1,
            bar: 'baz',
        });

        compare(entity1, doSerDe(entity1));
    });

    it('DEFAULT HANDLERS: serialize -> deserialize Date component', () => {
        const entity1 = new Entity();

        entity1.addComponent(new Date(0));

        {
            const entity2 = doSerDe(entity1);

            compare(entity1, entity2);
            expect(entity1.getComponent(Date)!.toString()).eq(entity2!.getComponent(Date)!.toString());
        }
    });

    it('DEFAULT HANDLERS: serialize -> deserialize Tag', () => {
        const entity1 = new Entity();

        entity1.addTag('test');

        compare(entity1, doSerDe(entity1));
    });
});
