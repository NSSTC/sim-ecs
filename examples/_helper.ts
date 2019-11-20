import {Component, EComponentRequirement, IEntity, ISystemWorld, IWorld, System} from "../src";

export class DelaySystem extends System {
    delay: number;

    constructor(delay: number = 500) {
        super();
        this.delay = delay;
    }

    update(world: IWorld, entities: IEntity[], deltaTime: number): Promise<void> {
        return new Promise<void>(res => setTimeout(res, this.delay));
    }
}

export class Gravity extends System {
    protected absTime = 0;

    constructor() {
        super();
        this.setComponentQuery([
            [Position, EComponentRequirement.WRITE],
            [Velocity, EComponentRequirement.WRITE],
        ]);
    }

    async update(world: ISystemWorld, entities: IEntity[], deltaTime: number): Promise<void> {
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
