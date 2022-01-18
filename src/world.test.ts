import {assert} from "chai";
import * as Components from "./test-data/components";
import * as Systems from "./test-data/systems";
import IWorld, {ISystemActions} from "./world.spec";
import {World} from "./world";
import {buildWorld} from "./ecs/ecs-world";
import {C1} from "./test-data/components";


describe('Manage Resources', () => {
    let world: World;

    beforeEach(() => {
        world = Object.seal(buildWorld().build()) as World;
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
    let world: IWorld;

    beforeEach(() => {
        world = Object.seal(buildWorld().build());
    });

    it('create', () => {
        assert.notEqual(world.createEntity(),null, 'Could not create a new entity');
        assert.equal(Array.from(world.getEntities()).length, 1, 'Number of entities in world does not match');
    });
});

describe('Run Systems', () => {
    const op = (c1: C1 ) => {
        c1.a++;
    }

    it('dispatch', async () => {
        const world = buildWorld().withDefaultScheduling(root => root.addNewStage(stage => stage.addSystem(Systems.S1(op)))).build();
        const entity = world.buildEntity().with(Components.C1).build();
        const c1 = entity.getComponent(Components.C1);

        world.commands.addEntity(entity);
        await world.flushCommands();
        await world.dispatch();

        assert(c1, 'Could not fetch component'); if (!c1) return;
        assert.equal(c1.a, 1, 'System did not operate on component');
    });

    it('run', async () => {
        const world = buildWorld().withDefaultScheduling(root => root.addNewStage(stage => stage.addSystem(Systems.S1(op)))).build();
        const entity = world.buildEntity().with(Components.C1).build();
        const c1 = entity.getComponent(Components.C1);
        let runFinished = false;

        world.commands.addEntity(entity);
        setTimeout(() => {
            runFinished = true;
            world.commands.stopRun();
        }, 20);
        await world.run();

        assert(runFinished, 'Run promise resolved early');
        assert(c1, 'Could not fetch component'); if (!c1) return;
        assert(c1.a > 0, 'System did not operate on component ' + c1.a.toString());
    });
});

describe('Delete Entities', () => {
    let counter = 0;

    it('delete before run', async () => {
        const world = buildWorld().build() as World;
        const entity = world.buildEntity().with(Components.C1).build();

        world.removeEntity(entity);
        assert.equal(Array.from(world.getEntities()).length, 0, 'Did not remove entity');
    });

    it('delete during run', async () => {
        const op = (actions: ISystemActions) => {
            if (counter == 0) {
                counter++;
                actions.commands.removeEntity(entity);
            }
            else {
                actions.commands.stopRun();
            }
        };
        const world = buildWorld().withDefaultScheduling(root => root.addNewStage(stage => stage.addSystem(Systems.S2(op)))).build();
        const entity = world.buildEntity().with(Components.C1).build();

        await world.run({
            // this helps speed up the test by executing the loop in a blocking way
            executionFunction: (fn: Function) => fn(),
        });
        assert.equal(Array.from(world.getEntities()).length, 0, 'Did not remove entity');
    });
});

describe('Helpers', () => {
    it('merge two worlds', () => {
        const w1 = buildWorld().build();
        const w2 = buildWorld().build();

        w1.buildEntity().build();
        w1.buildEntity().with(new Date(0)).build();
        w2.buildEntity().with(new Date(1337)).build();

        w2.merge(w1);

        const w2Entities = Array.from(w2.getEntities());

        assert.equal(Array.from(w1.getEntities()).length, 0, 'Entities were not removed from w1 on merge');
        assert.equal(w2Entities.length, 3, 'Entities were not added correctly to w2 on merge');
        assert.equal(w2Entities[1].hasComponent(Date), false, 'Complication on merge E1');
        assert.equal(w2Entities[2].getComponent(Date)?.getTime(), 0, 'Complication on merge E2');
        assert.equal(w2Entities[0].getComponent(Date)?.getTime(), 1337, 'Complication on merge E3');
    });
});
