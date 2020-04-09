import {ECS, IEntity, IWorld, State, System, IState} from "../src";
import {Gravity, Position, Velocity} from "./_helper";

const ecs = new ECS();
const world = ecs.createWorld();

class InitState extends State { _systems = [initSystem] }
class RunState extends State { _systems = [gravitySystem] }
class PauseState extends State { _systems = [pauseSystem] }

class Init extends System {
    async update(world: IWorld, entities: IEntity[], deltaTime: number): Promise<void> {
        console.log('INIT');
        world.getResource(SimulationData).state = runState;
    }
}

class Pause extends System {
    scheduled = false;
    async update(world: IWorld, entities: IEntity[], deltaTime: number): Promise<void> {
        console.log('PAUSE');
        if (!this.scheduled) {
            setTimeout(() => { world.getResource(SimulationData).state = runState; }, 3000);
            this.scheduled = true;
        }
    }
}

const initSystem = new Init();
const gravitySystem = new Gravity();
const pauseSystem = new Pause();

const initState = new InitState();
const runState = new RunState();
const pauseState = new PauseState();

class SimulationData {
    state: IState = initState;
}

world.addResource(Date);
world.addResource(SimulationData);

world.buildEntity()
    .with(Position)
    .with(Velocity)
    .build();

world.addSystem(initSystem);
world.addSystem(gravitySystem);
world.addSystem(pauseSystem);

const update = async function () {
    await world.dispatch(world.getResource(SimulationData).state);
    setTimeout(update, 500);
};

update().catch(console.error);
setTimeout(() => { world.getResource(SimulationData).state = pauseState; }, 3000);
