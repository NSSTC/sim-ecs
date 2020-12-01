import {Engine, Entity} from 'tick-knock';
import {ABenchmark, IBenchmark} from "../benchmark.spec";

class Transform {}
class Position { x = 0 }
class Rotation {}
class Velocity { x = 1 }

export class Benchmark extends ABenchmark {
    world: Engine;

    constructor(
        protected iterCount: number
    ) {
        super();
        this.world = new Engine();
    }

    cleanUp(): IBenchmark {
        this.world.removeAllEntities();
        return this;
    }

    run() {
        for (let i = 0; i < this.iterCount; i++) {
            this.world.addEntity(new Entity()
                .add(Transform)
                .add(Position)
                .add(Rotation)
                .add(Velocity));
        }
    }
}
