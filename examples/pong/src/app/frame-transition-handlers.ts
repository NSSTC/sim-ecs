import {GameStore} from "../models/game-store";
import {ITransitionActions} from "sim-ecs";

let lastTransition = Date.now();

export async function afterFrameHandler(actions: ITransitionActions) {
    const gameStore = actions.getResource(GameStore);

    if (gameStore.exit) {
        actions.stopRun();
        return;
    }

    if (gameStore.popState) {
        await actions.popState();
        gameStore.popState = false;
    }

    if (gameStore.PushState) {
        await actions.pushState(gameStore.PushState);
        gameStore.PushState = undefined;
    }
}

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
