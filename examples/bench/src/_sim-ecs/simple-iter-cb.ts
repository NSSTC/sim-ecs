import {ECS, ISystemActions, Query, Read, System, World, Write} from 'sim-ecs';
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


class SimpleIterSystem extends System {
    query = new Query({
        pos: Write(Position),
        vel: Read(Velocity)
    });

    run(actions: ISystemActions) {
        let pos, vel;
        this.query.execute(({pos, vel}) => {
            pos.x += vel.x;
        });
    }
}

export class Benchmark extends ABenchmark {
    count = 0;
    world: World;

    constructor(
        protected iterCount: number
    ) {
        super();
        this.world = new ECS()
            .buildWorld()
            .withSystem(SimpleIterSystem)
            .withComponents(
                Transform,
                Position,
                Rotation,
                Velocity,
            )
            .build() as World;

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

    cleanUp(): IBenchmark {
        this.count = 0;
        return this;
    }

    async init(): Promise<void> {
        await this.world.flushCommands();
        await this.world.prepareRun({
            afterStepHandler: (actions) => {
                if (this.count++ >= this.iterCount) { actions.commands.stopRun(); }
            },
            // to make the comparison fair, we will iterate in a sync loop over the steps, just like the others do
            executionFunction: (fn: Function) => fn(),
        });
    }

    run() {
        return this.world.run({}, true);
    }
}
