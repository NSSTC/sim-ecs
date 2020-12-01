import {Component, World} from 'ape-ecs';
import {ABenchmark, IBenchmark} from "../benchmark.spec";

class Transform extends Component {}
class Position extends Component { x = 0 }
class Rotation extends Component {}
class Velocity extends Component { x = 1 }

export class Benchmark extends ABenchmark {
    world: World;

    constructor(
        protected iterCount: number
    ) {
        super();
        this.world = new World();
        this.world.registerComponent(Transform);
        this.world.registerComponent(Position);
        this.world.registerComponent(Rotation);
        this.world.registerComponent(Velocity);

        for (let i = 0; i < 1000; i++) {
            this.world.createEntity({
                c: {
                    [Transform.name]: { type: Transform.name },
                    [Position.name]: { type: Position.name },
                    [Rotation.name]: { type: Rotation.name },
                    [Velocity.name]: { type: Velocity.name },
                }
            })
        }
    }

    cleanUp(): IBenchmark {
        return this;
    }

    run() {
        for (let i = 0; i < this.iterCount; i++) {
            this.world.runSystems('');
        }
    }
}
