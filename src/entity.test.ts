import {assert, expect} from 'chai';
import {Entity} from "./entity";

describe('Test Entity', () => {
    it('addComponent', () => {
        const entity = new Entity();

        entity.addComponent(new Number(0));
        assert.equal(Array.from(entity.getComponents()).length, 1);
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
