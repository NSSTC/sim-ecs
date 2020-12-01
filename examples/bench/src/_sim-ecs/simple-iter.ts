import {ECS, Read, State, System, SystemData, World, Write} from 'sim-ecs';
import {ABenchmark, IBenchmark} from "../benchmark.spec";

class Transform {
}

class Position {
    x = 0
}

class Rotation {
}

class Velocity {
    x = 1
}


class Data extends SystemData {
    pos = Write(Position);
    vel = Read(Velocity);
}

class SimpleIterSystem extends System<Data> {
    readonly SystemDataType = Data;

    run(dataSet: Set<Data>) {
        let pos, vel;
        for ({pos, vel} of dataSet) {
            pos.x += vel.x;
        }
    }
}

class SimpleIterState extends State {
}

export class Benchmark extends ABenchmark {
    world: World;

    constructor(
        protected iterCount: number
    ) {
        super();
        this.world = new ECS()
            .buildWorld()
            .withSystem(SimpleIterSystem)
            .withComponents([
                Transform,
                Position,
                Rotation,
                Velocity,
            ])
            .build() as World;

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

    async init(): Promise<void> {
        let counter = 0;
        await this.world.prepareRun({
            afterStepHandler: (actions) => {
                if (counter++ == this.iterCount) {
                    actions.stopRun();
                }
            },
            executionFunction: (fn: Function) => fn(),
            initialState: SimpleIterState,
        });
    }

    async run() {
        return this.world.run({}, true);
    }
}
