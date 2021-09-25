import {Engine, Entity} from 'tick-knock';
import {IBenchmark} from "../../benchmark.spec";

class Transform {}
class Position { x = 0 }
class Rotation {}
class Velocity { x = 1 }

export class Benchmark implements IBenchmark {
    readonly name = 'tick-knock';
    world: Engine;

    constructor(
        protected iterCount: number
    ) {
        this.world = new Engine();
    }

    init() {}

    reset() {
        this.world.removeAllEntities();
    }

    run() {
        for (let i = 0; i < this.iterCount; i++) {
            this.world.addEntity(new Entity()
                .add(new Transform())
                .add(new Position())
                .add(new Rotation())
                .add(new Velocity()));
        }
    }
}
