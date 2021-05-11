import {Position} from "../components/position";
import {Read, System, SystemData, Write} from "sim-ecs";
import {Velocity} from "../components/velocity";

class Data extends SystemData {
    pos = Write(Position)
    readonly vel = Read(Velocity)
}

export class AnimationSystem extends System<Data> {
    SystemDataType = Data;

    run(dataSet: Set<Data>): void | Promise<void> {
        for (const {pos, vel} of dataSet) {
            pos.x += vel.x;
            pos.y += vel.y;
        }
    }
}
