import {ISystemActions, System} from "sim-ecs";
import {GameStore} from "../models/game-store";
import {GameState} from "../states/game";
import {PauseState} from "../states/pause";


export class PauseSystem extends System {
    readonly states = [GameState, PauseState];

    gameStore!: GameStore;

    setup(actions: ISystemActions) {
        this.gameStore = actions.getResource(GameStore);
    }

    run(actions: ISystemActions) {
        const isGameState = this.gameStore.currentState?.constructor == GameState;
        const isPauseState = this.gameStore.currentState?.constructor == PauseState;

        if (!isGameState && !isPauseState) {
            return;
        }

        if (this.gameStore.input.actions.togglePause) {
            if (isGameState) {
                actions.commands.pushState(PauseState);
            } else {
                actions.commands.popState();
            }
        }
    }
}
