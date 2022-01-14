import {createSystem, Storage, WriteResource} from "sim-ecs";
import {GameStore} from "../models/game-store";

export const BeforeStepSystem = createSystem({
    gameStore: WriteResource(GameStore),
    ctx: WriteResource(CanvasRenderingContext2D),
    storage: Storage({ lastTransition: 0 })
})
    .withRunFunction(({gameStore, ctx, storage}) => {
        { // Update delta time
            const now = Date.now();
            gameStore.lastFrameDeltaTime = now - storage.lastTransition;
            storage.lastTransition = now;
        }

        { // Clear canvas
            ctx.beginPath();
            ctx.fillStyle = '#222';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    })
    .build();
