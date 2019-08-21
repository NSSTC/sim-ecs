import {Component, ECS, IEntity, IWorld, State, System, ISystem} from "../src";
import IState from '../src/state.spec';

const ecs = new ECS();
const world = ecs.createWorld();

class InitState extends State { _systems = [initSystem] }
class RunState extends State { _systems = [gravitySystem] }
class PauseState extends State { _systems = [pauseSystem] }

class Position extends Component {
    x = 0;
    y = 0;
}

class Velocity extends Component {
    x = 0;
    y = 0;
}

class Init extends System {
    update(world: IWorld, entities: IEntity[], deltaTime: number): void {
        console.log('INIT');
        world.getResource(SimulationData).state = runState;
    }
} const initSystem = new Init();

class Gravity extends System {
    protected absTime = 0;

    constructor() {
        super();
        this.setComponentQuery({
            Position: true,
            Velocity: true,
        });
    }

    update(world: IWorld, entities: IEntity[], deltaTime: number): void {
        this.absTime += deltaTime;
        for (let entity of entities) {
            const pos = entity.getComponent(Position);
            const vel = entity.getComponent(Velocity);

            if (!pos || !vel) continue;

            vel.y -= Math.pow(0.00981, 2) * this.absTime;
            pos.y += vel.y;

            console.log(`Pos: ${pos.y.toFixed(5)}    Vel: ${vel.y.toFixed(5)}`);
        }
    }
} const gravitySystem = new Gravity();

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
    .with(Position)
    .with(Velocity)
    .build();

world.registerSystem(initSystem);
world.registerSystem(gravitySystem);
world.registerSystem(pauseSystem);

const update = function () {
    world.dispatch(world.getResource(SimulationData).state);
    setTimeout(update, 500);
};

update();
setTimeout(() => { world.getResource(SimulationData).state = pauseState; }, 3000);
