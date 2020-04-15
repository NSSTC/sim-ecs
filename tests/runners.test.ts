import * as assert from "assert";
import {ECS, IWorld} from "..";
import * as Components from "./components";
import * as Systems from "./systems";
import {S1Data, S2Data, THandlerFn1, THandlerFn2} from "./systems";
import {System, With, Without} from "../src";


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
        assert.equal(Array.from(world.getEntities()).length, 1, 'Number of entities in world does not match');
    });

    it('build', () => {
        assert.notEqual(world.buildEntity().build(),null, 'Could not build a new entity');
        assert.equal(Array.from(world.getEntities()).length, 1, 'Number of entities in world does not match');
    });

    it('build_with_component', () => {
        const entity = world.buildEntity().with(Components.C1).build();
        assert.equal(Array.from(world.getEntities()).length, 1, 'Number of entities in world does not match');
        assert(entity.hasComponent(Components.C1), 'Component not found on entity');
        assert(entity.hasComponentName(Components.C1.name), 'Component not found by name on entity');
        assert.equal(
            Array.from(world.getEntities([With(Components.C1)])).length,
            1,
            'Number of entities with component C1 does not match'
        );
        assert.equal(
            Array.from(world.getEntities([Without(Components.C1)])).length,
            0,
            'Number of entities with component C1 does not match'
        );
        assert.equal(
            Array.from(world.getEntities([With(Components.C2)])).length,
            0,
            'Number of entities with component C2 does not match'
        );
        assert.equal(
            Array.from(world.getEntities([With(Components.C1), With(Components.C2)])).length,
            0,
            'Number of entities with component C1 & C2 does not match'
        );
    });
});

describe('Run Systems', () => {
    const op: THandlerFn1 = (data: S1Data) => {
        if (data.c1) {
            data.c1.a++;
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
        world.addSystem(new Systems.S1(() => {}));
        assert.equal(world.systems.length, 1, 'System was not registered');
    });

    it('dispatch', () => {
        const entity = world.buildEntity().with(Components.C1).build();
        const c1 = entity.getComponent(Components.C1);

        world.addSystem(new Systems.S1(op));
        world.dispatch();

        assert(c1, 'Could not fetch component'); if (!c1) return;
        assert.equal(c1.a, 1, 'System did not operate on component');
    });

    it('run', async () => {
        const entity = world.buildEntity().with(Components.C1).build();
        const c1 = entity.getComponent(Components.C1);
        let runFinished = false;

        world.addSystem(new Systems.S1(op));
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

describe('Delete Entities', () => {
    let counter = 0;
    let entityCount = -1;
    const op: THandlerFn2 = (data: Set<S2Data>) => {
        entityCount = data.size;
    };
    let ecs: ECS;
    let world: IWorld;

    before(() => {
        ecs = Object.seal(new ECS());
    });

    beforeEach(() => {
        counter = 0;
        entityCount = -1;
        world = Object.seal(ecs.createWorld());
    });

    it('delete before run', async () => {
        const entity = world.buildEntity().with(Components.C1).build();

        world.removeEntity(entity);
        assert.equal(Array.from(world.getEntities()).length, 0, 'Did not remove entity');
    });

    it('delete during run', async () => {
        const entity = world.buildEntity().with(Components.C1).build();

        world.addSystem(new Systems.S2(op));
        await world.run({
            transitionHandler: async actions => {
                if (counter == 0) {
                    counter++;
                    actions.removeEntity(entity);
                }
                else {
                    actions.stopRun();
                }
            }
        });

        assert.equal(Array.from(world.getEntities()).length, 0, 'Did not remove entity');
        assert.notEqual(entityCount, -1, 'System did not run');
        assert.equal(entityCount, 0, 'Data set was not deleted');
    });
});
