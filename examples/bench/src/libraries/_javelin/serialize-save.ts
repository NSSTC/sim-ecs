import {createWorld, component, World, number, createQuery} from "@javelin/ecs"
import {IBenchmark} from "../../benchmark.spec";

const Transform = {}
const Position = { x: number }
const Rotation = {}
const Velocity = { x: number }

export class Benchmark implements IBenchmark {
    readonly name = 'Javelin';
    comment = '';
    world: World;

    constructor(
        protected iterCount: number
    ) {
        this.world = createWorld();
    }

    reset() {}

    async init(): Promise<void> {
        for (let i = 0; i < 1000; i++) {
            this.world.create(
                component(Transform),
                component(Position, { x: 0 }),
                component(Rotation),
                component(Velocity, { x: 1 }),
            );
        }

        this.world.step(null);

        {
            const json = JSON.stringify(this.world.createSnapshot());
            this.comment = `file size: ${new TextEncoder().encode(json).length / 1024} KB`;
        }
    }

    async run() {
        const snapshot = JSON.stringify(this.world.createSnapshot());
        createWorld({ snapshot: JSON.parse(snapshot) });
    }
}
