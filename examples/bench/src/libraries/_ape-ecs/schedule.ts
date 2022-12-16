import {Component, System, World} from "ape-ecs";
import {IBenchmark} from "../../benchmark.spec";

class A extends Component { static properties = { val: 0 } }
class B extends Component { static properties = { val: 0 } }
class C extends Component { static properties = { val: 0 } }
class D extends Component { static properties = { val: 0 } }
class E extends Component { static properties = { val: 0 } }

class ABSystem extends System {
    q = this.createQuery().fromAll('A', 'B').persist();

    update() {
        const entities = this.q.execute();
        let a, b, entity;
        for (entity of entities) {
            a = entity.c.A;
            b = entity.c.B;
            [a.val, b.val] = [b.val, a.val];
        }
    }
}

class CDSystem extends System {
    q = this.createQuery().fromAll('C', 'D').persist();

    update() {
        const entities = this.q.execute();
        let c, d, entity;
        for (entity of entities) {
            c = entity.c.C;
            d = entity.c.D;
            [c.val, d.val] = [d.val, c.val];
        }
    }
}

class CESystem extends System {
    q = this.createQuery().fromAll('C', 'E').persist();

    update() {
        const entities = this.q.execute();
        let c, e, entity;
        for (entity of entities) {
            c = entity.c.C;
            e = entity.c.E;
            [c.val, e.val] = [e.val, c.val];
        }
    }
}

export class Benchmark implements IBenchmark {
    readonly name = 'Ape-ECS'
    world: World;

    constructor(
        protected iterCount: number
    ) {
        this.world = new World();
        this.world.registerComponent(A);
        this.world.registerComponent(B);
        this.world.registerComponent(C);
        this.world.registerComponent(D);
        this.world.registerComponent(E);
        this.world.registerSystem('step', ABSystem);
        this.world.registerSystem('step', CDSystem);
        this.world.registerSystem('step', CESystem);

        for (let i = 0; i < 10000; i++) {
            this.world.createEntity({
                c: {
                    [A.name]: { val: 0 },
                }
            });
        }

        for (let i = 0; i < 10000; i++) {
            this.world.createEntity({
                c: {
                    [A.name]: { val: 0 },
                    [B.name]: { val: 0 },
                }
            });
        }

        for (let i = 0; i < 10000; i++) {
            this.world.createEntity({
                c: {
                    [A.name]: { val: 0 },
                    [B.name]: { val: 0 },
                    [C.name]: { val: 0 },
                }
            });
        }

        for (let i = 0; i < 10000; i++) {
            this.world.createEntity({
                c: {
                    [A.name]: { val: 0 },
                    [B.name]: { val: 0 },
                    [C.name]: { val: 0 },
                    [D.name]: { val: 0 },
                }
            });
        }

        for (let i = 0; i < 10000; i++) {
            this.world.createEntity({
                c: {
                    [A.name]: { val: 0 },
                    [B.name]: { val: 0 },
                    [C.name]: { val: 0 },
                    [E.name]: { val: 0 },
                }
            });
        }
    }

    init() {}

    reset() {}

    async run() {
        for (let i = 0; i < this.iterCount; i++) {
            this.world.runSystems('step');
        }
    }
}
