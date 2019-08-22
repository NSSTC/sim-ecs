import {ECS, IEntity, IWorld, State, System} from "../src";
import IState from '../src/state.spec';
import {Gravity, Position, Velocity} from "./_helper";

const ecs = new ECS();
const world = ecs.createWorld();

class InitState extends State { _systems = [initSystem] }
class RunState extends State { _systems = [gravitySystem, terrainPhysicsSystem] }
class PauseState extends State { _systems = [pauseSystem] }

class Init extends System {
    update(world: IWorld, entities: IEntity[], deltaTime: number): void {
        console.log('INIT');
        world.getResource(SimulationData).state = runState;
    }
} const initSystem = new Init();

class TerrainPhysics extends System {
    constructor() {
        super();
        this.setComponentQuery({
            Position: true,
        });
    }

    update(world: IWorld, entities: IEntity[], deltaTime: number): void {
        for (let entity of entities) {
            const pos = entity.getComponent(Position);
            if (!pos) continue;
            if (pos.y < 0) {
                pos.y = 10;
            }

            console.log('Terrain Physics!');
        }
    }
} const terrainPhysicsSystem = new TerrainPhysics();

const gravitySystem = new Gravity();

class Pause extends System {
    scheduled = false;
    update(world: IWorld, entities: IEntity[], deltaTime: number): void {
        console.log('PAUSE');
        if (!this.scheduled) {
            setTimeout(() => { world.getResource(SimulationData).state = runState; }, 3000);
            this.scheduled = true;
        }
    }
} const pauseSystem = new Pause();

const initState = new InitState();
const runState = new RunState();
const pauseState = new PauseState();

class SimulationData {
    state: IState = initState;
}

world.addResource(Date);
world.addResource(SimulationData);

world.buildEntity()
    .withQuick(Position)
    .withQuick(Velocity)
    .build();

world.registerSystemQuick(initSystem);
world.registerSystemQuick(terrainPhysicsSystem, [Gravity]);
world.registerSystemQuick(gravitySystem);
world.registerSystemQuick(pauseSystem);
world.maintain();

const update = function () {
    world.dispatch(world.getResource(SimulationData).state);
    setTimeout(update, 500);
};

update();
setTimeout(() => { world.getResource(SimulationData).state = pauseState; }, 3000);
