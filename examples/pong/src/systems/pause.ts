import {Actions, createSystem, hmrSwapSystem, ReadResource} from "sim-ecs";
import {GameStore} from "../models/game-store.ts";
import {GameState} from "../states/game.ts";
import {PauseState} from "../states/pause.ts";


export const PauseSystem = createSystem({
    actions: Actions,
    gameStore: ReadResource(GameStore),
})
    .withName('PauseSystem')
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

// @ts-ignore
hmr:if (import.meta.hot) {
    // @ts-ignore
    import.meta.hot.accept(mod => hmrSwapSystem(mod[Object.getOwnPropertyNames(mod)[0]]));
}
