import {
    addComponent,
    addEntity,
    createWorld,
    defineComponent,
    IWorld,
    removeEntity,
    setDefaultSize,
    Types
} from 'bitecs';
import { IBenchmark } from '../../benchmark.spec';

const Transform = defineComponent({});
const Position = defineComponent({ x: Types.i32 });
const Rotation = defineComponent({});
const Velocity = defineComponent({ x: Types.i32 });

export class Benchmark implements IBenchmark {
    readonly name = 'bitecs';
    entityIds: number[] = [];
    world!: IWorld;

    constructor(
        protected readonly iterCount: number
    ) {
        setDefaultSize(1000001);
        this.world = createWorld();
    }

    init() {}

    async reset() {
        this.entityIds.forEach(id => removeEntity(this.world, id));
        this.entityIds.length = 0;
    }

    run() {
        let eid;
        for (let i = 0; i < this.iterCount; i++) {
            eid = addEntity(this.world);
            this.entityIds.push(eid);

            addComponent(this.world, Transform, eid);
            addComponent(this.world, Position, eid);
            addComponent(this.world, Rotation, eid);
            addComponent(this.world, Velocity, eid);
        }
    }
}
