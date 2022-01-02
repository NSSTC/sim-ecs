import {Position} from "../components/position";
import {createSystem, Query, Read, Write} from "sim-ecs";
import {Velocity} from "../components/velocity";


export const AnimationSystem = createSystem(
    new Query({
        pos: Write(Position),
        vel: Read(Velocity),
    }),
)
    .withRunFunction((query) => {
        return query.execute(({pos, vel}) => {
            pos.x += vel.x;
            pos.y += vel.y;
        });
    })
    .build();
