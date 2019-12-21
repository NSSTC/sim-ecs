import * as assert from "assert";
import {ECS, IEntity, IWorld} from "..";
import * as Components from "./components";
import * as Systems from "./systems";
import {EComponentRequirement} from "../src";


describe('Manage Resources', () => {
    let ecs: ECS;
    let world: IWorld;

    before(() => {
        ecs = Object.seal(new ECS());
    });

    beforeEach(() => {
        world = Object.seal(ecs.createWorld());
    });

    it('Store resource', () => {
        world.addResource(Date);
        assert(world.getResource(Date), 'Resource was not stored');
        assert(world.getResource(Date) instanceof Date, 'Resource type does not match')
    });

    it('Replace resource', () => {
        world.addResource(new Number(42));
        assert.equal(world.getResource(Number), 42, 'Resource was not stored');

        world.replaceResource(new Number(1337));
        assert.equal(world.getResource(Number), 1337, 'Resource was not replaced');
    });
});

describe('Build Entities', () => {
    let ecs: ECS;
    let world: IWorld;

    before(() => {
        ecs = Object.seal(new ECS());
    });

    beforeEach(() => {
        world = Object.seal(ecs.createWorld());
    });

    it('create', () => {
        assert.notEqual(world.createEntity(),null, 'Could not create a new entity');
        assert.equal(world.getEntities().length, 1, 'Number of entities in world does not match');
    });

    it('build', () => {
        assert.notEqual(world.buildEntity().build(),null, 'Could not build a new entity');
        assert.equal(world.getEntities().length, 1, 'Number of entities in world does not match');
    });

    it('build_with_component', () => {
        const entity = world.buildEntity().with(Components.C1).build();
        assert.equal(world.getEntities().length, 1, 'Number of entities in world does not match');
        assert(entity.hasComponent(Components.C1), 'Component not found on entity');
        assert(entity.hasComponentName(Components.C1.name), 'Component not found by name on entity');
        assert.equal(
            world.getEntities([[Components.C1, EComponentRequirement.READ]]).length,
            1,
            'Number of entities with component C1 does not match'
        );
        assert.equal(
            world.getEntities([[Components.C1, EComponentRequirement.UNSET]]).length,
            0,
            'Number of entities with component C1 does not match'
        );
        assert.equal(
            world.getEntities([[Components.C2, EComponentRequirement.READ]]).length,
            0,
            'Number of entities with component C2 does not match'
        );
        assert.equal(
            world.getEntities([[Components.C1, EComponentRequirement.READ], [Components.C2,EComponentRequirement.READ]]).length,
            0,
            'Number of entities with component C1&C2 does not match'
        );
    });

    it('build_with_component_quick', () => {
        const entity = world.buildEntity().withQuick(Components.C1).build();
        assert.equal(world.getEntities().length, 1, 'Number of entities in world does not match');
        assert(entity.hasComponent(Components.C1), 'Component not found on entity');
        assert(entity.hasComponentName(Components.C1.name), 'Component not found by name on entity');
    });
});

describe('Run Systems', () => {
    const op = (entity: IEntity) => {
        const c1 = entity.getComponent(Components.C1);

        if (c1) {
            c1.a++;
        }
    };
    let ecs: ECS;
    let world: IWorld;

    before(() => {
        ecs = Object.seal(new ECS());
    });

    beforeEach(() => {
        world = Object.seal(ecs.createWorld());
    });

    it('register', () => {
        world.registerSystem(new Systems.S1(() => {}));
        assert.equal(world.systems.length, 1, 'System was not registered');
    });

    it('register_quick', () => {
        world.registerSystemQuick(new Systems.S1(() => {}));
        assert.equal(world.systems.length, 1, 'System was not registered');
    });

    it('dispatch', () => {
        const entity = world.buildEntity().with(Components.C1).build();
        const c1 = entity.getComponent(Components.C1);

        world.registerSystem(new Systems.S1(op));
        world.dispatch();

        assert(c1, 'Could not fetch component'); if (!c1) return;
        assert.equal(c1.a, 1, 'System did not operate on component');
    });

    it('quick+dispatch', () => {
        const entity = world.buildEntity().withQuick(Components.C1).build();
        const c1 = entity.getComponent(Components.C1);

        world.registerSystemQuick(new Systems.S1(op));
        world.dispatch();

        assert(c1, 'Could not fetch component'); if (!c1) return;
        assert.equal(c1.a, 0, 'Component was added to systems pre-maturely');

        world.maintain();
        world.dispatch();

        assert(c1, 'Could not fetch component'); if (!c1) return;
        assert.equal(c1.a, 1, 'System did not operate on component');
    });

    it('run', async () => {
        const entity = world.buildEntity().with(Components.C1).build();
        const c1 = entity.getComponent(Components.C1);
        let runFinished = false;

        world.registerSystem(new Systems.S1(op));
        setTimeout(() => {
            runFinished = true;
            world.stopRun();
        }, 100);
        await world.run();

        assert(runFinished, 'Run promise resolved early');
        assert(c1, 'Could not fetch component'); if (!c1) return;
        assert(c1.a > 0, 'System did not operate on component');
    });
});
