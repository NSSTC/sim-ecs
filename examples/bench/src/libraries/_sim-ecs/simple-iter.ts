import {
    buildWorld,
    createSystem,
    IPreptimeWorld,
    IRuntimeWorld,
    queryComponents,
    Read,
    Write
} from '../../../../../src';
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
    prepWorld: IPreptimeWorld;
    runWorld!: IRuntimeWorld;

    constructor(
        protected iterCount: number
    ) {
        this.prepWorld = buildWorld()
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
            .build();

        this.prepWorld.addResource(CounterResource, iterCount);

        for (let i = 0; i < 1000; i++) {
            this.prepWorld.buildEntity()
                .withAll(
                    Transform,
                    Position,
                    Rotation,
                    Velocity,
                )
                .build();
        }
    }

    reset(): void {
        this.count = 0;
    }

    async init(): Promise<void> {
        this.runWorld = await this.prepWorld.prepareRun({
            executionFunction: (fn: Function) => fn()
        });
    }

    run(): Promise<void> {
        return this.runWorld.start();
    }
}
