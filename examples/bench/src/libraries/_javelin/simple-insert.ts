import {createWorld, component, World, number} from "@javelin/ecs"
import { IBenchmark } from '../../benchmark.spec';

const Transform = {}
const Position = { x: number }
const Rotation = {}
const Velocity = { x: number }

export class Benchmark implements IBenchmark {
    readonly name = 'javelin';
    world!: World;

    constructor(
        protected readonly iterCount: number
    ) {
        this.world = createWorld();
    }

    init(): Promise<void> | void {}

    async reset() {
        this.world.reset();
    }

    run() {
        for (let i = 0; i < this.iterCount; i++) {
            this.world.create(
                component(Transform),
                component(Position, { x: 0 }),
                component(Rotation),
                component(Velocity, { x: 1 }),
            );
        }
    }
}
