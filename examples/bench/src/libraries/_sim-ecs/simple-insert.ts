import {buildWorld, IPreptimeWorld} from '../../../../..';
import { IBenchmark } from '../../benchmark.spec';

class Transform {}
class Position { x = 0 }
class Rotation {}
class Velocity { x = 1 }

export class Benchmark implements IBenchmark {
    readonly name = 'sim-ecs';
    world!: IPreptimeWorld;

    constructor(
        protected readonly iterCount: number
    ) {}

    async init(): Promise<void> {
        this.world = await buildWorld()
            .withComponents(
                Transform,
                Position,
                Rotation,
                Velocity,
            )
            .build();
    }

    async reset() {
        this.world.clearEntities();
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
