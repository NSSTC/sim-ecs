import {Position} from "../components/position.ts";
import {createSystem, hmrSwapSystem, ISystem, queryComponents, Read, ReadResource, Write} from "sim-ecs";
import {Velocity} from "../components/velocity.ts";
import {GameStore} from "../models/game-store.ts";


export const AnimationSystem = createSystem({
    gameStore: ReadResource(GameStore),
    query: queryComponents({
        pos: Write(Position),
        vel: Read(Velocity),
    }),
})
    .withName('AnimationSystem')
    .withRunFunction(({gameStore, query}) => {
        const k = gameStore.lastFrameDeltaTime / 10;
        return query.execute(({pos, vel}) => {
            pos.x += vel.x * k;
            pos.y += vel.y * k;
        });
    })
    .build();

// @ts-ignore
hmr:if (import.meta.hot) {
    // @ts-ignore
    import.meta.hot.accept(mod => hmrSwapSystem(mod[Object.getOwnPropertyNames(mod)[0]]));
}
