import {Actions, createSystem, ReadResource} from "sim-ecs";
import {GameStore} from "../models/game-store";
import {GameState} from "../states/game";
import {PauseState} from "../states/pause";


export const PauseSystem = createSystem({
    actions: Actions,
    gameStore: ReadResource(GameStore),
})
    .withRunFunction(({actions, gameStore}) => {
        const isGameState = gameStore.currentState?.constructor == GameState;
        const isPauseState = gameStore.currentState?.constructor == PauseState;

        if (!isGameState && !isPauseState) {
            return;
        }

        if (gameStore.input.actions.togglePause) {
            if (isGameState) {
                actions.commands.pushState(PauseState);
            } else {
                actions.commands.popState();
            }
        }
    })
    .build();
