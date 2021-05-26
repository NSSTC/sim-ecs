import {GameStore} from "../models/game-store";
import {ITransitionActions} from "sim-ecs";

let lastTransition = Date.now();

export async function beforeFrameHandler(actions: ITransitionActions) {
    { // Update delta time
        const gameStore = actions.getResource(GameStore);
        const now = Date.now();
        gameStore.lastFrameDeltaTime = now - lastTransition;
        lastTransition = now;
    }

    { // Clear canvas
        const ctx = actions.getResource(CanvasRenderingContext2D);
        ctx.beginPath();
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
}
