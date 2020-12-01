import {ECS, IWorld} from 'sim-ecs';
import {ABenchmark, IBenchmark} from "../benchmark.spec";

class Transform {}
class Position { x = 0 }
class Rotation {}
class Velocity { x = 1 }

export class Benchmark extends ABenchmark {
    world: IWorld;
    world2: IWorld;

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

        this.world2 = new ECS()
            .buildWorld()
            .withComponents([
                Transform,
                Position,
                Rotation,
                Velocity,
            ])
            .build();

        for (let i = 0; i < 1000; i++) {
            this.world.buildEntity()
                .with(Transform)
                .with(Position)
                .with(Rotation)
                .with(Velocity)
                .build();
        }

        this.world.maintain();
    }

    cleanUp(): IBenchmark {
        return this;
    }

    async run() {
        const json = JSON.stringify(this.world.toPrefab());
        this.world2.loadPrefab(JSON.parse(json));
    }
}
