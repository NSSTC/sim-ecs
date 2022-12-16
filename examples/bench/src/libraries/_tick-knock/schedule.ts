import {Engine, Entity, Query, System} from "tick-knock";
import {IBenchmark} from "../../benchmark.spec";

class A { constructor(public val: number) {} }
class B { constructor(public val: number) {} }
class C { constructor(public val: number) {} }
class D { constructor(public val: number) {} }
class E { constructor(public val: number) {} }

class ABSystem extends System {
    query = new Query(entity => entity.hasAll(A, B));

    onAddedToEngine() {
        this.engine.addQuery(this.query);
    }

    onRemovedFromEngine() {
        this.engine.removeQuery(this.query);
    }

    update() {
        let a, b, entity;
        for (entity of this.query.entities) {
            a = entity.get(A)!;
            b = entity.get(B)!;
            [a.val, b.val] = [b.val, a.val];
        }
    }
}

class CDSystem extends System {
    query = new Query(entity => entity.hasAll(C, D));

    onAddedToEngine() {
        this.engine.addQuery(this.query);
    }

    onRemovedFromEngine() {
        this.engine.removeQuery(this.query);
    }

    update() {
        let c, d, entity;
        for (entity of this.query.entities) {
            c = entity.get(C)!;
            d = entity.get(D)!;
            [c.val, d.val] = [d.val, c.val];
        }
    }
}

class CESystem extends System {
    query = new Query(entity => entity.hasAll(C, E));

    onAddedToEngine() {
        this.engine.addQuery(this.query);
    }

    onRemovedFromEngine() {
        this.engine.removeQuery(this.query);
    }

    update() {
        let c, e, entity;
        for (entity of this.query.entities) {
            c = entity.get(C)!;
            e = entity.get(E)!;
            [c.val, e.val] = [e.val, c.val];
        }
    }
}

export class Benchmark implements IBenchmark {
    readonly name = 'tick-knock';
    world: Engine;

    constructor(
        protected iterCount: number
    ) {
        this.world = new Engine()
            .addSystem(new ABSystem())
            .addSystem(new CDSystem())
            .addSystem(new CESystem());

        for (let i = 0; i < 10000; i++) {
            this.world.addEntity(new Entity()
                .add(new A(0))
            );
        }

        for (let i = 0; i < 10000; i++) {
            this.world.addEntity(new Entity()
                .add(new A(0))
                .add(new B(0))
            );
        }

        for (let i = 0; i < 10000; i++) {
            this.world.addEntity(new Entity()
                .add(new A(0))
                .add(new B(0))
                .add(new C(0))
            );
        }

        for (let i = 0; i < 10000; i++) {
            this.world.addEntity(new Entity()
                .add(new A(0))
                .add(new B(0))
                .add(new C(0))
                .add(new D(0))
            );
        }

        for (let i = 0; i < 10000; i++) {
            this.world.addEntity(new Entity()
                .add(new A(0))
                .add(new B(0))
                .add(new C(0))
                .add(new E(0))
            );
        }
    }

    init() {}

    reset() {}

    async run() {
        for (let i = 0; i < this.iterCount; i++) {
            this.world.update(0);
        }
    }
}
