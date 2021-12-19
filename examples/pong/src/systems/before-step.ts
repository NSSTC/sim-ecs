import {ISystemActions, System} from "sim-ecs";
import {GameStore} from "../models/game-store";

export class BeforeStepSystem extends System {
    lastTransition = Date.now();

    run(actions: ISystemActions) {
        { // Update delta time
            const gameStore = actions.getResource(GameStore);
            const now = Date.now();
            gameStore.lastFrameDeltaTime = now - this.lastTransition;
            this.lastTransition = now;
        }

        { // Clear canvas
            const ctx = actions.getResource(CanvasRenderingContext2D);
            ctx.beginPath();
            ctx.fillStyle = '#222';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }
}
