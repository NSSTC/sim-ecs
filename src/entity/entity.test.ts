import {assert, expect} from 'chai';
import {Entity} from "./entity.ts";
import {SerDe} from "../serde/serde.ts";

describe('Test Entity', () => {
    it('addComponent', () => {
        const entity = new Entity();

        entity.addComponent(new Number(0));
        assert.equal(Array.from(entity.getComponents()).length, 1);
    });

    it('clone', () => {
        const component = { a: 42 };
        const entity = new Entity('1');

        entity.addComponent(component);
        entity.addTag('TEST');

        const clonedEntity = entity.clone(new SerDe(), '2');

        assert.notEqual(entity, clonedEntity);
        assert.notEqual(entity.id, clonedEntity.id);

        assert.equal(entity.getComponentCount(), clonedEntity.getComponentCount());
        assert.notEqual(entity.getComponents().next().value, clonedEntity.getComponents().next().value);
        // @ts-ignore
        assert.equal(entity.getComponents().next().value.a, clonedEntity.getComponents().next().value.a);

        assert.equal(entity.getTagCount(), clonedEntity.getTagCount());
        assert.equal(entity.getTags().next().value, clonedEntity.getTags().next().value);
    });

    it('removeComponent', () => {
        const component = {};
        const entity = new Entity();

        entity.addComponent(component);
        entity.removeComponent(component);
        assert.equal(Array.from(entity.getComponents()).length, 0);
    });

    it('Unique components', () => {
        const component = {};
        const entity = new Entity();

        entity.addComponent(component);
        expect(entity.addComponent.bind(entity, component)).to.throw();
    });
});
