import {createWorld, component, World, number, createQuery} from "@javelin/ecs"
import { IBenchmark } from '../../benchmark.spec';

const A = { val: number };
const B = { val: number };
const C = { val: number };
const D = { val: number };
const E = { val: number };

export class Benchmark implements IBenchmark {
    readonly name = 'javelin';
    world!: World;

    constructor(
        protected readonly iterCount: number
    ) {
        this.world = createWorld();
        this.world.addSystem(() =>
            createQuery(A, B)
            ((_e, [a, b]) => {
                [a.val, b.val] = [b.val, a.val];
            })
        );

        this.world.addSystem(() =>
            createQuery(C, D)
            ((_e, [c, d]) => {
                [c.val, d.val] = [d.val, c.val];
            })
        );

        this.world.addSystem(() =>
            createQuery(C, E)
            ((_e, [c, e]) => {
                [c.val, e.val] = [e.val, c.val];
            })
        );

        for (let i = 0; i < 10000; i++) {
            this.world.create(
                component(A, { val: 0 }),
            );
        }

        for (let i = 0; i < 10000; i++) {
            this.world.create(
                component(A, { val: 0 }),
                component(B, { val: 0 }),
            );
        }

        for (let i = 0; i < 10000; i++) {
            this.world.create(
                component(A, { val: 0 }),
                component(B, { val: 0 }),
                component(C, { val: 0 }),
            );
        }

        for (let i = 0; i < 10000; i++) {
            this.world.create(
                component(A, { val: 0 }),
                component(B, { val: 0 }),
                component(C, { val: 0 }),
                component(D, { val: 0 }),
            );
        }

        for (let i = 0; i < 10000; i++) {
            this.world.create(
                component(A, { val: 0 }),
                component(B, { val: 0 }),
                component(C, { val: 0 }),
                component(E, { val: 0 }),
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
