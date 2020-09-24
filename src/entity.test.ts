import {assert, expect} from 'chai';
import {Entity} from "./entity";
import {access, EAccess, Read, ReadEntity, With, Without, Write} from "./system.spec";

describe('Test Entity', () => {
    it('addComponent', () => {
        const entity = new Entity();

        entity.addComponent(0);
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

    it('matchesQueue() No components, empty queue', () => {
        expect(new Entity().matchesQueue([])).eq(true);
    });

    it('matchesQueue() No components with queue', () => {
        expect(new Entity().matchesQueue([ReadEntity()])).eq(true);
        expect(new Entity().matchesQueue([Write(Date)])).eq(false);
        expect(new Entity().matchesQueue([Read(Date)])).eq(false);
        expect(new Entity().matchesQueue([With(Date)])).eq(false);
        expect(new Entity().matchesQueue([Without(Date)])).eq(true);
    });

    it('matchesQueue() Component without queue', () => {
        expect(new Entity().addComponent(new Date()).matchesQueue([])).eq(true);
    });

    it('matchesQueue() Component with queue', () => {
        const entity = new Entity().addComponent(new Date());

        expect(entity.matchesQueue([ReadEntity()])).eq(true);
        expect(entity.matchesQueue([Write(Date)])).eq(true);
        expect(entity.matchesQueue([Read(Date)])).eq(true);
        expect(entity.matchesQueue([With(Date)])).eq(true);
        expect(entity.matchesQueue([Without(Date)])).eq(false);
    });

    it('matchesQueue() Multiple components with queue', () => {
        const entity = new Entity().addComponent(new Date()).addComponent(new Map());

        expect(entity.matchesQueue([ReadEntity()])).eq(true);
        expect(entity.matchesQueue([Write(Date)])).eq(true);
        expect(entity.matchesQueue([Read(Date)])).eq(true);
        expect(entity.matchesQueue([With(Date)])).eq(true);
        expect(entity.matchesQueue([Without(Date)])).eq(false);

        expect(entity.matchesQueue([Write(Map)])).eq(true);
        expect(entity.matchesQueue([Read(Map)])).eq(true);
        expect(entity.matchesQueue([With(Map)])).eq(true);
        expect(entity.matchesQueue([Without(Map)])).eq(false);

        expect(entity.matchesQueue([With(Date), With(Map)])).eq(true);
        expect(entity.matchesQueue([Without(Date), With(Map)])).eq(false);
        expect(entity.matchesQueue([With(Date), Without(Map)])).eq(false);
        expect(entity.matchesQueue([Without(Date), Without(Map)])).eq(false);

        expect(entity.matchesQueue([With(Date), With(Set)])).eq(false);
        expect(entity.matchesQueue([Without(Date), With(Set)])).eq(false);
        expect(entity.matchesQueue([With(Date), Without(Set)])).eq(true);
        expect(entity.matchesQueue([Without(Date), Without(Set)])).eq(false);
    });
});
