import {ECS, System, SystemData, World, Write} from 'sim-ecs';
import {ABenchmark, IBenchmark} from "../benchmark.spec";

class A { constructor(public val: number) {} }
class B { constructor(public val: number) {} }
class C { constructor(public val: number) {} }
class D { constructor(public val: number) {} }
class E { constructor(public val: number) {} }


class ABData extends SystemData {
    a = Write(A);
    b = Write(B);
}

class CDData extends SystemData {
    c = Write(C);
    d = Write(D);
}

class CEData extends SystemData {
    c = Write(C);
    e = Write(E);
}

class ABSystem extends System<ABData> {
    readonly SystemDataType = ABData;

    run(dataSet: Set<ABData>) {
        let a, b;
        for ({a, b} of dataSet) {
            [a.val, b.val] = [b.val, a.val];
        }
    }
}

class CDSystem extends System<CDData> {
    readonly SystemDataType = CDData;

    run(dataSet: Set<CDData>) {
        let c, d;
        for ({c, d} of dataSet) {
            [c.val, d.val] = [d.val, c.val];
        }
    }
}

class CESystem extends System<CEData> {
    readonly SystemDataType = CEData;

    run(dataSet: Set<CEData>) {
        let c, e;
        for ({c, e} of dataSet) {
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
        this.world = new ECS()
            .buildWorld()
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

        this.world.maintain();
    }

    cleanUp(): IBenchmark {
        return this;
    }

    async init(): Promise<void> {
        await this.world.prepareRun({
            afterStepHandler: (actions) => {
                    actions.stopRun();
            },
            // to make the comparison fair, we will iterate in a sync loop over the steps, just like the others do
            executionFunction: (fn: Function) => fn(),
        });
    }

    run() {
        return this.world.run({}, true);
    }
}
