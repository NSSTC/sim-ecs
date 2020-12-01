import {ECS, IWorld} from 'sim-ecs';
import {ABenchmark, IBenchmark} from "../benchmark.spec";

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
        this.world = new ECS()
            .buildWorld()
            .withComponents([
                Transform,
                Position,
                Rotation,
                Velocity,
            ])
            .build();
    }

    cleanUp(): IBenchmark {
        for (const entity of this.world.getEntities()) {
            this.world.removeEntity(entity);
        }

        return this;
    }

    run() {
        for (let i = 0; i < this.iterCount; i++) {
            this.world.buildEntity()
                .with(Transform)
                .with(Position)
                .with(Rotation)
                .with(Velocity)
                .build();
        }
    }
}
