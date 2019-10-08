import * as assert from "assert";
import {ECS, IWorld} from "..";
import {C1} from "./components";


describe('Entities', () => {
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
        const entity = world.buildEntity().with(C1).build();
        assert.equal(world.getEntities().length, 1, 'Number of entities in world does not match');
        assert(entity.hasComponent(C1), 'Component not found on entity');
    });
});
