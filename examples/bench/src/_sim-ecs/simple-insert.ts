import {buildWorld, IWorld} from 'sim-ecs';
import {ABenchmark} from "../benchmark.spec";

class Transform {}
class Position { x = 0 }
class Rotation {}
class Velocity { x = 1 }

export class Benchmark extends ABenchmark {
    world: IWorld;

    constructor(
        protected iterCount: number
    ) {
        super();
        this.world = buildWorld()
            .withComponents(
                Transform,
                Position,
                Rotation,
                Velocity,
            )
            .build();
    }

    async cleanUp() {
        this.world.commands.clearEntities();
        await this.world.flushCommands();
        return this;
    }

    run() {
        for (let i = 0; i < this.iterCount; i++) {
            this.world.buildEntity()
                .withAll(
                    Transform,
                    Position,
                    Rotation,
                    Velocity,
                )
                .build();
        }
    }
}
