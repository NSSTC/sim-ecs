import {buildWorld, IPreptimeWorld, SerialFormat} from '../../../../../src';
import {IBenchmark} from "../../benchmark.spec";

class Transform {}
class Position { x = 0 }
class Rotation {}
class Velocity { x = 1 }

export class Benchmark implements IBenchmark {
    readonly name = 'sim-ecs';
    world: IPreptimeWorld;
    world2: IPreptimeWorld;

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
            this.world.buildEntity()
                .withAll(
                    Transform,
                    Position,
                    Rotation,
                    Velocity,
                )
                .build();
        }

        {
            const json = this.world.save().toJSON();
            console.log(`${this.name} SerializeSave file size: ${new TextEncoder().encode(json).length / 1024} KB`);
        }
    }

    async run() {
        const json = this.world.save().toJSON();
        this.world2.load(SerialFormat.fromJSON(json));
    }
}
