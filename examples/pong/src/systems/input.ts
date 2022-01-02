import {Actions, createSystem, Storage} from "sim-ecs";
import {EMovement, GameStore} from "../models/game-store";
import {GameState} from "../states/game";
import {MenuState} from "../states/menu";
import {PauseState} from "../states/pause";

export enum EKeyState {
    Down,
    Up,
}

interface IInputEvent {
    key: string
    type: EKeyState
}

export const InputSystem = createSystem(
    Actions,
    Storage<{ gameStore: GameStore, inputEvents: IInputEvent[] }>(),
)
    .runInStates(GameState, MenuState, PauseState)
    .withSetupFunction((actions, storage) => {
        storage.gameStore = actions.getResource(GameStore);
        storage.inputEvents = [];

        window.addEventListener('keydown', event => storage.inputEvents.push({key: event.key, type: EKeyState.Down}));
        window.addEventListener('keyup', event => storage.inputEvents.push({key: event.key, type: EKeyState.Up}));
    })
    .withRunFunction((actions, storage) => {
        { // Reset input actions
            storage.gameStore.input.actions.menuConfirm = false;
            storage.gameStore.input.actions.menuMovement = EMovement.halt;
            storage.gameStore.input.actions.togglePause = false;
        }

        { // Work on all events which occurred during the last frame
            for (const event of storage.inputEvents) {
                storage.gameStore.input.keyStates[event.key] = event.type;

                if (event.type == EKeyState.Down) {
                    switch (event.key) {
                        case 'w':
                        case 'W': {
                            storage.gameStore.input.actions.leftPaddleMovement = EMovement.up;
                            storage.gameStore.input.actions.menuMovement = EMovement.up;
                            break;
                        }
                        case 'ArrowUp': {
                            storage.gameStore.input.actions.rightPaddleMovement = EMovement.up;
                            storage.gameStore.input.actions.menuMovement = EMovement.up;
                            break;
                        }
                        case 's':
                        case 'S': {
                            storage.gameStore.input.actions.leftPaddleMovement = EMovement.down;
                            storage.gameStore.input.actions.menuMovement = EMovement.down;
                            break;
                        }
                        case 'ArrowDown': {
                            storage.gameStore.input.actions.rightPaddleMovement = EMovement.down;
                            storage.gameStore.input.actions.menuMovement = EMovement.down;
                            break;
                        }
                        case 'Enter': {
                            storage.gameStore.input.actions.menuConfirm = true;
                            break;
                        }
                        case 'Escape': {
                            storage.gameStore.input.actions.togglePause = true;
                            break;
                        }
                    }
                } else {
                    switch (event.key) {
                        case 'w':
                        case 'W': {
                            storage.gameStore.input.actions.leftPaddleMovement = EMovement.halt;
                            break;
                        }
                        case 'ArrowUp': {
                            storage.gameStore.input.actions.rightPaddleMovement = EMovement.halt;
                            break;
                        }
                        case 's':
                        case 'S': {
                            storage.gameStore.input.actions.leftPaddleMovement = EMovement.halt;
                            break;
                        }
                        case 'ArrowDown': {
                            storage.gameStore.input.actions.rightPaddleMovement = EMovement.halt;
                            break;
                        }
                    }
                }
            }
        }

        // Clear event queue
        storage.inputEvents.length = 0;
    })
    .build();
