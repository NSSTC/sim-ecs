import {createWorld, component, World, number, createQuery} from "@javelin/ecs"
import { IBenchmark } from '../../benchmark.spec';

const Transform = {};
const Position = { x: number };
const Rotation = {};
const Velocity = { x: number };

export class Benchmark implements IBenchmark {
    readonly name = 'javelin';
    world!: World;

    constructor(
        protected readonly iterCount: number
    ) {
        const query = createQuery(Position, Velocity);

        this.world = createWorld();
        this.world.addSystem(() =>
            query((_e, [pos, vel]) => {
                pos.x += vel.x;
            })
        );

        for (let i = 0; i < 1000; i++) {
            this.world.create(
                component(Transform),
                component(Position, { x: 0 }),
                component(Rotation),
                component(Velocity, { x: 1 }),
            );
        }
    }

    init(): Promise<void> | void {}

    reset(): void {}

    run(): void {
        let i;
        for (i = 0; i < this.iterCount; i++) {
            this.world.step(null);
        }
    }
}
