import {assert} from "chai";
import {ECS, IWorld} from "../..";
import * as Components from "./components";
import * as Systems from "./systems";
import {S1Data, S2Data, THandlerFn1, THandlerFn2} from "./systems";
import {With, Without} from "../index";
import {defaultDeserializer} from "../save-format";


describe('Manage Resources', () => {
    let ecs: ECS;
    let world: IWorld;

    before(() => {
        ecs = Object.seal(new ECS());
    });

    beforeEach(() => {
        world = Object.seal(ecs.buildWorld().build());
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
        world = Object.seal(ecs.buildWorld().build());
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

    before(() => {
        ecs = Object.seal(new ECS());
    });

    it('register', () => {
        const world = ecs.buildWorld().withSystem(new Systems.S1(() => {})).build();
        assert.equal(world.systems.length, 1, 'System was not registered');
    });

    it('dispatch', async () => {
        const world = ecs.buildWorld().withSystem(new Systems.S1(op)).build();
        const entity = world.buildEntity().with(Components.C1).build();
        const c1 = entity.getComponent(Components.C1);

        await world.dispatch();

        assert(c1, 'Could not fetch component'); if (!c1) return;
        assert.equal(c1.a, 1, 'System did not operate on component');
    });

    it('run', async () => {
        const world = ecs.buildWorld().withSystem(new Systems.S1(op)).build();
        const entity = world.buildEntity().with(Components.C1).build();
        const c1 = entity.getComponent(Components.C1);
        let runFinished = false;

        setTimeout(() => {
            runFinished = true;
            world.stopRun();
        }, 20);
        await world.run();

        assert(runFinished, 'Run promise resolved early');
        assert(c1, 'Could not fetch component'); if (!c1) return;
        assert(c1.a > 0, 'System did not operate on component');
    });

    it ('no-data', async () => {
        let numComponents = 0;
        const world = ecs.buildWorld().withSystem(new Systems.NoDataSystem(dataSet => { numComponents = dataSet.size })).build();
        let runFinished = false;

        world.buildEntity().with(Components.C1).build();

        setTimeout(() => {
            runFinished = true;
            world.stopRun();
        });
        await world.run();

        assert.equal(numComponents, 0, 'NoDataSystem was assigned components to process');
    });
});

describe('Delete Entities', () => {
    let counter = 0;
    let entityCount = -1;
    const op: THandlerFn2 = (data: Set<S2Data>) => {
        entityCount = data.size;
    };
    let ecs: ECS;

    before(() => {
        ecs = Object.seal(new ECS());
    });

    beforeEach(() => {
        counter = 0;
        entityCount = -1;
    });

    it('delete before run', async () => {
        const world = ecs.buildWorld().build();
        const entity = world.buildEntity().with(Components.C1).build();

        world.removeEntity(entity);
        assert.equal(Array.from(world.getEntities()).length, 0, 'Did not remove entity');
    });

    it('delete during run', async () => {
        const world = ecs.buildWorld().withSystem(new Systems.S2(op)).build();
        const entity = world.buildEntity().with(Components.C1).build();

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

describe('Save / Load', () => {
    const serializedWorld = '[[],[["Date","1970-01-01T00:00:00.000Z"]],[["Date","1970-01-01T00:00:01.337Z"],["C1",{"a":0}]]]';
    let ecs: ECS;

    before(() => {
        ecs = Object.seal(new ECS());
    });

    it('merge two worlds', () => {
        const w1 = ecs.buildWorld().build();
        const w2 = ecs.buildWorld().build();

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

    it('save world to json', () => {
        const w1 = ecs.buildWorld().build();

        w1.buildEntity().build();
        w1.buildEntity().with(new Date(0)).build();
        w1.buildEntity().with(new Date(1337)).with(new Components.C1()).build();

        assert.equal(w1.toJSON(o => JSON.stringify(o)), serializedWorld, 'Unable to serialize world');
    });

    it('load world from json', () => {
        const w1 = ecs.buildWorld().fromJSON(serializedWorld, defaultDeserializer((cn, data) => {
            switch (cn) {
                case Components.C1.name: {
                    if (typeof data != 'object') {
                        throw new Error(`data is not of type object, but instead ${typeof data}!`);
                    }

                    const c = new Components.C1();
                    c.a = (data as Components.C1).a;
                    return c;
                }
                default: {
                    throw new Error('Unknown constructor name: ' + cn);
                }
            }
        })).build();

        assert.equal(w1.toJSON(c => JSON.stringify(c)), serializedWorld, 'deserialization is lossy')
    });
});
