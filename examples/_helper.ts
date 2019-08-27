import {Component, IEntity, IWorld, System} from "../src";

export function wait(time: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, time));
}

export class Gravity extends System {
    protected absTime = 0;

    constructor() {
        super();
        this.setComponentQuery({
            Position: true,
            Velocity: true,
        });
    }

    async update(world: IWorld, entities: IEntity[], deltaTime: number): Promise<void> {
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
}

export class Position extends Component {
    x = 0;
    y = 0;
}

export class Velocity extends Component {
    x = 0;
    y = 0;
}
