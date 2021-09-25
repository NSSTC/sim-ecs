import {buildWorld, IWorld} from '../../../../../src';
import { IBenchmark } from '../../benchmark.spec';

class Transform {}
class Position { x = 0 }
class Rotation {}
class Velocity { x = 1 }

export class Benchmark implements IBenchmark {
    readonly name = 'sim-ecs';
    world!: IWorld;

    constructor(
        protected readonly iterCount: number
    ) {
        this.world = buildWorld()
            .withComponents(
                Transform,
                Position,
                Rotation,
                Velocity,
            )
            .build();
    }

    init(): Promise<void> | void {}

    async reset() {
        this.world.commands.clearEntities();
        await this.world.flushCommands();
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
