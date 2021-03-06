import {Position} from "../components/position";
import {ISystemActions, Query, Read, System, Write} from "sim-ecs";
import {Velocity} from "../components/velocity";


export class AnimationSystem extends System {
    readonly query = new Query({
        pos: Write(Position),
        vel: Read(Velocity),
    });

    run(actions: ISystemActions) {
        this.query.execute(({pos, vel}) => {
            pos.x += vel.x;
            pos.y += vel.y;
        });
    }
}
