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

const Transform = defineComponent({});
const Position = defineComponent({ x: Types.ui32 });
const Rotation = defineComponent({});
const Velocity = defineComponent({ x: Types.ui32 });

const query = defineQuery([Position, Velocity]);
const simpleIterSystem = (world: IWorld) => {
    const ents = query(world);
    let eid;

    for (let i = 0; i < ents.length; i++) {
        eid = ents[i];
        Position.x[eid] += Velocity.x[eid];
    }

    return world;
};
const pipeline = pipe(simpleIterSystem);

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
                addComponent(this.world, Transform, eid);
                addComponent(this.world, Position, eid);
                addComponent(this.world, Rotation, eid);
                addComponent(this.world, Velocity, eid);
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
