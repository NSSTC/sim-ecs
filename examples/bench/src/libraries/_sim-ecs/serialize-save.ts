import {buildWorld, IWorld, SerialFormat} from '../../../../../src';
import {IBenchmark} from "../../benchmark.spec";

class Transform {}
class Position { x = 0 }
class Rotation {}
class Velocity { x = 1 }

export class Benchmark implements IBenchmark {
    readonly name = 'sim-ecs';
    world: IWorld;
    world2: IWorld;

    constructor(
        protected iterCount: number
    ) {
        this.world = buildWorld()
            .withComponents(
                Transform,
                Position,
                Rotation,
                Velocity,
            )
            .build();

        this.world2 = buildWorld()
            .withComponents(
                Transform,
                Position,
                Rotation,
                Velocity,
            )
            .build();
    }

    reset() {}

    async init(): Promise<void> {
        for (let i = 0; i < 1000; i++) {
            this.world.commands.buildEntity()
                .withAll(
                    Transform,
                    Position,
                    Rotation,
                    Velocity,
                )
                .build();
        }

        await this.world.flushCommands();
        this.world.maintain();

        {
            const json = this.world.save().toJSON();
            console.log(`sim-ecs SerializeSave file size: ${new TextEncoder().encode(json).length / 1024} KB`);
        }
    }

    async run() {
        const json = this.world.save().toJSON();
        this.world2.commands.load(SerialFormat.fromJSON(json));
        await this.world2.flushCommands();
    }
}
