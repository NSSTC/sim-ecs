import {Component, ECS, IEntity, IWorld, System} from "../src";

const ecs = new ECS();
const world = ecs.createWorld();

class Position extends Component {
    x = 0;
    y = 0;
}

class Velocity extends Component {
    x = 0;
    y = 0;
}

const Gravity = class extends System {
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

};

world.buildEntity()
    .with(Position)
    .with(Velocity)
    .build();


world.registerSystem(new Gravity());

const update = function () {
    world.dispatch();
    setTimeout(update, 500);
};

update();
