import {Engine, Entity, Query, System} from 'tick-knock';
import {ABenchmark, IBenchmark} from "../benchmark.spec";

class Transform {}
class Position { x = 0 }
class Rotation {}
class Velocity { x = 1 }

class SimpleIterSystem extends System {
    query = new Query(entity => entity.hasAll(Position, Velocity));

    constructor() {
        super();
    }

    update() {
        let entity;
        for (entity of this.query.entities) {
            entity.get(Position)!.x += entity.get(Velocity)!.x;
        }
    }
}

export class Benchmark extends ABenchmark {
    world: Engine;

    constructor(
        protected iterCount: number
    ) {
        super();

        const system = new SimpleIterSystem();

        this.world = new Engine()
            .addSystem(system)
            .addQuery(system.query);

        for (let i = 0; i < 1000; i++) {
            this.world.addEntity(new Entity()
                .add(Transform)
                .add(Position)
                .add(Rotation)
                .add(Velocity));
        }
    }

    cleanUp(): IBenchmark {
        return this;
    }

    run() {
        for (let i = 0; i < this.iterCount; i++) {
            this.world.update(0);
        }
    }
}
