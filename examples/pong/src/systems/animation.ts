import {Position} from "../components/position";
import {createSystem, Query, Read, ReadResource, Write} from "sim-ecs";
import {Velocity} from "../components/velocity";
import {GameStore} from "../models/game-store";


export const AnimationSystem = createSystem(
    ReadResource(GameStore),
    new Query({
        pos: Write(Position),
        vel: Read(Velocity),
    }),
)
    .withRunFunction((gameStore, query) => {
        const k = gameStore.lastFrameDeltaTime / 10;
        return query.execute(({pos, vel}) => {
            pos.x += vel.x * k;
            pos.y += vel.y * k;
        });
    })
    .build();
