import {Actions, createSystem, Storage} from "sim-ecs";
import {GameStore} from "../models/game-store";

// todo: we need a system storage
let lastTransition = Date.now();

export const BeforeStepSystem = createSystem(Actions, Storage<{ gameStore: GameStore }>())
    .withSetupFunction((actions, storage) => {
        storage.gameStore = actions.getResource(GameStore);
    })
    .withRunFunction((actions, storage) => {
        { // Update delta time
            const now = Date.now();
            storage.gameStore.lastFrameDeltaTime = now - lastTransition;
            lastTransition = now;
        }

        { // Clear canvas
            const ctx = actions.getResource(CanvasRenderingContext2D);
            ctx.beginPath();
            ctx.fillStyle = '#222';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    })
    .build();
