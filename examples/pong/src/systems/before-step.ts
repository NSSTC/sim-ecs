import {createSystem, Storage, WriteResource} from "sim-ecs";
import {GameStore} from "../models/game-store";

export const BeforeStepSystem = createSystem(
    WriteResource(GameStore),
    WriteResource(CanvasRenderingContext2D),
    Storage<{ lastTransition: number }>({ lastTransition: 0 })
)
    .withRunFunction((gameStore, ctx, storage) => {
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
