import {Component, System, World} from 'ape-ecs';
import {ABenchmark, IBenchmark} from "../benchmark.spec";

class Transform extends Component {}
class Position extends Component { static properties = { x: 0 } }
class Rotation extends Component {}
class Velocity extends Component { static properties = { x: 1 } }

class SimpleIterSystem extends System {
    q = this.createQuery().fromAll('Position', 'Velocity').persist();

    update() {
        const entities = this.q.execute();
        let entity;
        for (entity of entities) {
            // this is in the examples and API doc, but it's 10x slower than the below alternative!
            //entity.getOne('Position')!.x += entity.getOne('Velocity')!.x;
            // this is taken from the benchmark script in the ape repository
            entity.c.Position.x += entity.c.Velocity.x;
        }
    }
}

export class Benchmark extends ABenchmark {
    world: World;

    constructor(
        protected iterCount: number
    ) {
        super();
        this.world = new World({ trackChanges: false, entityPool: 1000 });
        this.world.registerSystem('step', SimpleIterSystem);
        this.world.registerComponent(Transform);
        this.world.registerComponent(Position);
        this.world.registerComponent(Rotation);
        this.world.registerComponent(Velocity);

        for (let i = 0; i < 1000; i++) {
            this.world.createEntity({
                components: [
                    { type: Transform.name, key: Transform.name },
                    { type: Position.name, key: Position.name, x: 0 },
                    { type: Rotation.name, key: Rotation.name },
                    { type: Velocity.name, key: Velocity.name, x: 1 },
                ]
            })
        }
    }

    cleanUp(): IBenchmark {
        return this;
    }

    run() {
        for (let i = 0; i < this.iterCount; i++) {
            this.world.runSystems('step');
        }
    }
}
