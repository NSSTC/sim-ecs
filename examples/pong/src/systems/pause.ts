import {Actions, createSystem, Storage} from "sim-ecs";
import {GameStore} from "../models/game-store";
import {GameState} from "../states/game";
import {PauseState} from "../states/pause";


export const PauseSystem = createSystem(Actions, Storage<{ gameStore: GameStore }>())
    .runInStates(GameState, PauseState)
    .withSetupFunction((actions, storage) => {
        storage.gameStore = actions.getResource(GameStore);
    })
    .withRunFunction((actions, storage) => {
        const isGameState = storage.gameStore.currentState?.constructor == GameState;
        const isPauseState = storage.gameStore.currentState?.constructor == PauseState;

        if (!isGameState && !isPauseState) {
            return;
        }

        if (storage.gameStore.input.actions.togglePause) {
            if (isGameState) {
                actions.commands.pushState(PauseState);
            } else {
                actions.commands.popState();
            }
        }
    })
    .build();
