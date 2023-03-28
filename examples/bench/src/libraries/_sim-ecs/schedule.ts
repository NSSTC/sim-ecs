import {buildWorld, createSystem, IPreptimeWorld, IRuntimeWorld, queryComponents, Write} from '../../../../..';
import type {IBenchmark} from "../../benchmark.spec";
import {CheckEndSystem, CounterResource} from "./_";

class A { constructor(public val: number = 0) {} }
class B { constructor(public val: number = 0) {} }
class C { constructor(public val: number = 0) {} }
class D { constructor(public val: number = 0) {} }
class E { constructor(public val: number = 0) {} }


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
    prepWorld: IPreptimeWorld;
    runWorld!: IRuntimeWorld;

    constructor(
        protected iterCount: number
    ) {
        this.prepWorld = buildWorld()
            .withDefaultScheduling(root => root
                .addNewStage(stage => stage
                    .addSystem(ABSystem)
                    .addSystem(CDSystem)
                    .addSystem(CESystem)
                    .addSystem(CheckEndSystem)
                )
            )
            .withComponents(A, B, C, D, E)
            .build();

        this.prepWorld.addResource(CounterResource, iterCount);

        for (let i = 0; i < 10000; i++) {
            this.prepWorld.buildEntity()
                .with(A, 0)
                .build();
        }

        for (let i = 0; i < 10000; i++) {
            this.prepWorld.buildEntity()
                .withAll(A, B)
                .build();
        }

        for (let i = 0; i < 10000; i++) {
            this.prepWorld.buildEntity()
                .withAll(A, B, C)
                .build();
        }

        for (let i = 0; i < 10000; i++) {
            this.prepWorld.buildEntity()
                .withAll(A, B, C, D)
                .build();
        }

        for (let i = 0; i < 10000; i++) {
            this.prepWorld.buildEntity()
                .withAll(A, B, C, E)
                .build();
        }
    }

    reset() {
        this.runWorld.getResource(CounterResource).count = 0;
    }

    async init(): Promise<void> {
        this.runWorld = await this.prepWorld.prepareRun({
            // to make the comparison fair, we will iterate in a sync loop over the steps, just like the others do
            executionFunction: (fn: Function) => fn(),
        });
    }

    run() {
        return this.runWorld.start();
    }
}
