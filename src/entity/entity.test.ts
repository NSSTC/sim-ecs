import {assert, expect} from 'chai';
import {Entity} from "./entity.ts";
import {SerDe} from "../serde/serde.ts";

describe('Test Entity', () => {
    it('addComponent', () => {
        const entity = new Entity();

        entity.addComponent(new Number(0));
        assert.equal(Array.from(entity.getComponents()).length, 1);
    });

    it('addTag', () => {
        const entity = new Entity();
        const tag = 'TEST';

        entity.addTag(tag);
        assert.equal(entity.getTagCount(), 1);
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

    it('getComponent', () => {
        const entity = new Entity();

        entity.addComponent(new Number(0));
        assert.equal(entity.getComponent(Number).toString(), '0');

        entity.addComponent(new Date());
        assert.instanceOf(entity.getComponent(Date), Date);
    });

    it('getTag', () => {
        const entity = new Entity();
        const tag = 'TEST';

        entity.addTag(tag);
        assert.equal(entity.getTags().next().value, tag);
    });

    it('getTags', () => {
        const entity = new Entity();
        const tag1 = 'TEST1';
        const tag2 = 'TEST2';
        const tag3 = 'TEST3';

        entity.addTag(tag1);
        entity.addTag(tag2);
        entity.addTag(tag3);

        // order should be equal!
        const tags = entity.getTags()
        assert.equal(tags.next().value, tag1);
        assert.equal(tags.next().value, tag2);
        assert.equal(tags.next().value, tag3);
    });

    it('hasComponent', () => {
        const entity = new Entity();
        const component = new Date();

        entity.addComponent(component);
        assert.equal(entity.hasComponent(Date), true);
        assert.equal(entity.hasComponent(component), true);
    });

    it('hasEvent', () => {
        const entity = new Entity();
        const event = () => {};

        entity.addEventListener('addTag', event);
        assert.equal(entity.hasEventListener('addTag', event), true);
        assert.equal(entity.hasEventListener('addTag', () => {}), false);
        assert.equal(entity.hasEventListener('clone', event), false);
    });

    it('hasTag', () => {
        const entity = new Entity();
        const tag = 'TEST';

        entity.addTag(tag);
        assert.equal(entity.hasTag(tag), true);
        assert.equal(entity.hasTag('DOESNOTEXIST!!!'), false);
    });

    it('removeComponent', () => {
        const component = {};
        const entity = new Entity();

        entity.addComponent(component);
        entity.removeComponent(component);
        assert.equal(Array.from(entity.getComponents()).length, 0);
    });

    it ('removeEvent', () => {
        const entity = new Entity();
        const event = () => {};

        entity.addEventListener('addComponent', event);
        entity.removeEventListener('addComponent', event);

        assert.equal(entity.hasEventListener('addComponent', event), false);
    });

    it('removeTag', () => {
        const entity = new Entity();
        const tag = 'TEST';

        entity.addTag(tag);
        entity.removeTag(tag);

        assert.equal(entity.hasTag(tag), false);
        assert.equal(Array.from(entity.getTags()).length, 0);
    });

    it('Unique components', () => {
        const component = {};
        const entity = new Entity();

        entity.addComponent(component);
        expect(entity.addComponent.bind(entity, component)).to.throw();
    });

    it('Events: AddComponent', () => {
        const component = {};
        const entity = new Entity();
        let eventCalled = false;

        entity.addEventListener("addComponent", event => {
            assert.equal(event.componentInstance, component);
            eventCalled = true;
        });

        entity.addComponent(component);
        assert.equal(eventCalled, true);
    });

    it('Events: AddTag', () => {
        const tag = 'awww';
        const entity = new Entity();
        let eventCalled = false;

        entity.addEventListener("addTag", event => {
            assert.equal(event.tag, tag);
            eventCalled = true;
        });

        entity.addTag(tag);
        assert.equal(eventCalled, true);
    });

    it('Events: Clone', () => {
        const component = {
            foo: 42,
        };
        const entity = new Entity();
        let eventCalled = false;

        entity.addEventListener("clone", event => {
            assert.equal(event.original, entity);
            assert.equal(event.clone.getComponents().next()!.value.foo, component.foo);
            eventCalled = true;
        });

        entity.addComponent(component);
        entity.clone(new SerDe());
        assert.equal(eventCalled, true);
    });

    it('Events: RemoveComponent', () => {
        const component = {};
        const entity = new Entity();
        let eventCalled = false;

        entity.addEventListener("removeComponent", event => {
            assert.equal(event.componentInstance, component);
            eventCalled = true;
        });

        entity.addComponent(component);
        assert.equal(eventCalled, false);
        entity.removeComponent(component);
        assert.equal(eventCalled, true);
    });

    it('Events: RemoveTag', () => {
        const tag = 'awww';
        const entity = new Entity();
        let eventCalled = false;

        entity.addEventListener("removeTag", event => {
            assert.equal(event.tag, tag);
            eventCalled = true;
        });

        entity.addTag(tag);
        assert.equal(eventCalled, false);
        entity.removeTag(tag);
        assert.equal(eventCalled, true);
    });
});
