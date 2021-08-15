import {buildWorld, ISystemActions, Query, System, World, Write} from 'sim-ecs';
import {ABenchmark, IBenchmark} from "../benchmark.spec";

class A { constructor(public val: number) {} }
class B { constructor(public val: number) {} }
class C { constructor(public val: number) {} }
class D { constructor(public val: number) {} }
class E { constructor(public val: number) {} }


class ABSystem extends System {
    query = new Query({
        a: Write(A),
        b: Write(B)
    });

    run(actions: ISystemActions) {
        let a, b;
        for ({a, b} of this.query.iter()) {
            [a.val, b.val] = [b.val, a.val];
        }
    }
}

class CDSystem extends System {
    query = new Query({
        c: Write(C),
        d: Write(D)
    });

    run(actions: ISystemActions) {
        let c, d;
        for ({c, d} of this.query.iter()) {
            [c.val, d.val] = [d.val, c.val];
        }
    }
}

class CESystem extends System {
    query = new Query({
        c: Write(C),
        e: Write(E)
    });

    run(actions: ISystemActions) {
        let c, e;
        for ({c, e} of this.query.iter()) {
            [c.val, e.val] = [e.val, c.val];
        }
    }
}

export class Benchmark extends ABenchmark {
    world: World;

    constructor(
        protected iterCount: number
    ) {
        super();
        this.world = buildWorld()
            .withSystem(ABSystem)
            .withSystem(CDSystem)
            .withSystem(CESystem)
            .withComponents(A, B, C, D, E)
            .build() as World;

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

    cleanUp(): IBenchmark {
        return this;
    }

    async init(): Promise<void> {
        let count = 0;
        await this.world.flushCommands();
        await this.world.prepareRun({
            afterStepHandler: (actions) => {
                if (count++ >= this.iterCount) { actions.commands.stopRun(); }
            },
            // to make the comparison fair, we will iterate in a sync loop over the steps, just like the others do
            executionFunction: (fn: Function) => fn(),
        });
    }

    run() {
        return this.world.run({}, true);
    }
}
