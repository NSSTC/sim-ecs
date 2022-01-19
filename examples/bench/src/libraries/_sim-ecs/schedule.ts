import {buildWorld, createSystem, queryComponents, World, Write} from '../../../../../src';
import {IBenchmark} from "../../benchmark.spec";
import {CheckEndSystem, CounterResource} from "./_";

class A { constructor(public val: number) {} }
class B { constructor(public val: number) {} }
class C { constructor(public val: number) {} }
class D { constructor(public val: number) {} }
class E { constructor(public val: number) {} }


const ABSystem = createSystem({
    query: queryComponents({
        a: Write(A),
        b: Write(B)
    })
}).withRunFunction(({query}) => {
    let a, b;
    for ({a, b} of query.iter()) {
        [a.val, b.val] = [b.val, a.val];
    }
}).build();


const CDSystem = createSystem({
    query: queryComponents({
        c: Write(C),
        d: Write(D)
    })
}).withRunFunction(({query}) => {
    let c, d;
    for ({c, d} of query.iter()) {
        [c.val, d.val] = [d.val, c.val];
    }
}).build();

const CESystem = createSystem({
    query: queryComponents({
        c: Write(C),
        e: Write(E)
    })
}).withRunFunction(({query}) => {
    let c, e;
    for ({c, e} of query.iter()) {
        [c.val, e.val] = [e.val, c.val];
    }
}).build();


export class Benchmark implements IBenchmark {
    readonly name = 'sim-ecs';
    count = 0;
    world: World;

    constructor(
        protected iterCount: number
    ) {
        this.world = buildWorld()
            .withDefaultScheduling(root => root
                .addNewStage(stage => stage
                    .addSystem(ABSystem)
                    .addSystem(CDSystem)
                    .addSystem(CESystem)
                    .addSystem(CheckEndSystem)
                )
            )
            .withComponents(A, B, C, D, E)
            .build() as World;

        this.world.addResource(CounterResource, iterCount);

        for (let i = 0; i < 10000; i++) {
            this.world.buildEntity()
                .with(A, 0)
                .build();
        }

        for (let i = 0; i < 10000; i++) {
            this.world.buildEntity()
                .with(A, 0)
                .with(B, 0)
                .build();
        }

        for (let i = 0; i < 10000; i++) {
            this.world.buildEntity()
                .with(A, 0)
                .with(B, 0)
                .with(C, 0)
                .build();
        }

        for (let i = 0; i < 10000; i++) {
            this.world.buildEntity()
                .with(A, 0)
                .with(B, 0)
                .with(C, 0)
                .with(D, 0)
                .build();
        }

        for (let i = 0; i < 10000; i++) {
            this.world.buildEntity()
                .with(A, 0)
                .with(B, 0)
                .with(C, 0)
                .with(D, 0)
                .with(E, 0)
                .build();
        }
    }

    reset() {
        this.world.getResource(CounterResource).count = 0;
    }

    async init(): Promise<void> {
        await this.world.flushCommands();
        await this.world.prepareRun({
            // to make the comparison fair, we will iterate in a sync loop over the steps, just like the others do
            executionFunction: (fn: Function) => fn(),
        });
    }

    run() {
        return this.world.run({}, true);
    }
}
