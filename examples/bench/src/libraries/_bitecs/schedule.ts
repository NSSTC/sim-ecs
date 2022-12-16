import {
    addComponent,
    addEntity,
    createWorld,
    defineComponent, defineQuery,
    IWorld, pipe,
    setDefaultSize,
    Types
} from 'bitecs';
import { IBenchmark } from '../../benchmark.spec';

const A = defineComponent({ val: Types.ui32 });
const B = defineComponent({ val: Types.ui32 });
const C = defineComponent({ val: Types.ui32 });
const D = defineComponent({ val: Types.ui32 });
const E = defineComponent({ val: Types.ui32 });

const queryAB = defineQuery([A, B]);
const queryCD = defineQuery([C, D]);
const queryCE = defineQuery([C, E]);

const systemAB = (world: IWorld) => {
    const ents = queryAB(world);
    let eid;

    for (let i = 0; i < ents.length; i++) {
        eid = ents[i];
        [A.val[eid], B.val[eid]] = [B.val[eid], A.val[eid]];
    }

    return world;
};
const systemCD = (world: IWorld) => {
    const ents = queryCD(world);
    let eid;

    for (let i = 0; i < ents.length; i++) {
        eid = ents[i];
        [C.val[eid], D.val[eid]] = [D.val[eid], C.val[eid]];
    }

    return world;
};
const systemCE = (world: IWorld) => {
    const ents = queryCE(world);
    let eid;

    for (let i = 0; i < ents.length; i++) {
        eid = ents[i];
        [C.val[eid], E.val[eid]] = [E.val[eid], C.val[eid]];
    }

    return world;
};
const pipeline = pipe(systemAB, systemCD, systemCE);

export class Benchmark implements IBenchmark {
    readonly name = 'bitecs';
    world!: IWorld;

    constructor(
        protected readonly iterCount: number
    ) {
        setDefaultSize(1000001);
        this.world = createWorld();

        {
            let eid;

            for (let i = 0; i < 1000; i++) {
                eid = addEntity(this.world);
                addComponent(this.world, A, eid);
            }

            for (let i = 0; i < 1000; i++) {
                eid = addEntity(this.world);
                addComponent(this.world, A, eid);
                addComponent(this.world, B, eid);
            }

            for (let i = 0; i < 1000; i++) {
                eid = addEntity(this.world);
                addComponent(this.world, A, eid);
                addComponent(this.world, B, eid);
                addComponent(this.world, C, eid);
            }

            for (let i = 0; i < 1000; i++) {
                eid = addEntity(this.world);
                addComponent(this.world, A, eid);
                addComponent(this.world, B, eid);
                addComponent(this.world, C, eid);
                addComponent(this.world, D, eid);
            }

            for (let i = 0; i < 1000; i++) {
                eid = addEntity(this.world);
                addComponent(this.world, A, eid);
                addComponent(this.world, B, eid);
                addComponent(this.world, C, eid);
                addComponent(this.world, E, eid);
            }
        }
    }

    init() {}

    reset() {}

    run() {
        for (let i = 0; i < this.iterCount; i++) {
            pipeline(this.world);
        }
    }
}
