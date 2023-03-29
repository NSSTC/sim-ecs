import {createSystem, hmrSwapSystem, Storage, WriteResource} from "sim-ecs";
import {GameStore} from "../models/game-store.ts";


const CFrameTimeCap = 33;

export const BeforeStepSystem = createSystem({
    gameStore: WriteResource(GameStore),
    ctx: WriteResource(CanvasRenderingContext2D),
    storage: Storage({ lastTransition: 0 })
})
    .withName('BeforeStepSystem')
    .withRunFunction(({gameStore, ctx, storage}) => {
        { // Update delta time
            const now = Date.now();
            gameStore.lastFrameDeltaTime = Math.min(now - storage.lastTransition, CFrameTimeCap);
            storage.lastTransition = now;
        }

        { // Clear canvas
            ctx.beginPath();
            ctx.fillStyle = '#222';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    })
    .build();

// @ts-ignore
hmr:if (import.meta.hot) {
    // @ts-ignore
    import.meta.hot.accept(mod => hmrSwapSystem(mod[Object.getOwnPropertyNames(mod)[0]]));
}
