import {expect} from 'chai';
import {SerDe} from "./serde";
import {Entity, IEntity} from "../entity";
import {SerialFormat} from "./serial-format";

describe('Test SerDe', () => {
    it('serialize/deserialize round-trip with default handlers', () => {
        const entity1 = new Entity();
        const serde = new SerDe();
        const options = {
            useDefaultHandler: true,
            useRegisteredHandlers: false,
        };

        entity1.addComponent([42]);
        entity1.addComponent(new Date(0));
        entity1.addTag('test');

        const serial = serde.serialize({entities: [entity1].values()}, options).toJSON();
        const entity2: IEntity | undefined  = serde.deserialize(SerialFormat.fromJSON(serial), options).entities.next().value;

        {
            expect(entity2 instanceof Entity).eq(true);

            const entity1Tags = Array.from(entity1.getTags());
            const entity2Tags = Array.from(entity2!.getTags());


            expect(entity1.getComponent(Array)?.pop()).eq(entity2!.getComponent(Array)?.pop()).not.eq(undefined);
            expect(entity1.getComponent(Date)!.toString()).eq(entity2!.getComponent(Date)!.toString());
            expect(entity1Tags.length).eq(entity2Tags.length);
            expect(entity1Tags[0]).eq(entity2Tags[0]);
        }
    });
});
