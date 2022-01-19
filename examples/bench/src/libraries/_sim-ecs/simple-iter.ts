import {buildWorld, createSystem, queryComponents, Read, World, Write} from '../../../../../src';
import {IBenchmark} from "../../benchmark.spec";
import {CheckEndSystem, CounterResource} from "./_";

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


const SimpleIterSystem = createSystem({
    query: queryComponents({
        pos: Write(Position),
        vel: Read(Velocity)
    })
}).withRunFunction(({query}) => {
    let pos, vel;
    for ({pos, vel} of query.iter()) {
        pos.x += vel.x;
    }
}).build();


export class Benchmark implements IBenchmark {
    readonly name = 'sim-ecs';
    count = 0;
    world: World;

    constructor(
        protected iterCount: number
    ) {
        this.world = buildWorld()
            .withDefaultScheduling(root => root
                .addNewStage(stage => stage
                    .addSystem(SimpleIterSystem)
                    .addSystem(CheckEndSystem)
                )
            )
            .withComponents(
                Transform,
                Position,
                Rotation,
                Velocity,
            )
            .build() as World;

        this.world.addResource(CounterResource, iterCount);

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
    }

    reset() {
        this.count = 0;
    }

    async init(): Promise<void> {
        await this.world.flushCommands();
        await this.world.prepareRun({
            // to make the comparison fair, we will iterate in a sync loop over the steps, just like the others do
            executionFunction: (fn: Function) => fn(),
        });
    }

    run() {
        return this.world.run({}, true);
    }
}
