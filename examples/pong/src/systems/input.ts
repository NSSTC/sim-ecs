import {createSystem, hmrSwapSystem, Storage, WriteResource} from "sim-ecs";
import {EMovement, GameStore} from "../models/game-store.ts";

export enum EKeyState {
    Down,
    Up,
}

interface IInputEvent {
    key: string
    type: EKeyState
}

export const InputSystem = createSystem({
    gameStore: WriteResource(GameStore),
    inputEvents: Storage<IInputEvent[]> ([]),
})
    .withName('InputSystem')
    .withSetupFunction(({inputEvents}) => {
        window.addEventListener('keydown', event => inputEvents.push({key: event.key, type: EKeyState.Down}));
        window.addEventListener('keyup', event => inputEvents.push({key: event.key, type: EKeyState.Up}));
    })
    .withRunFunction(({gameStore, inputEvents}) => {
        { // Reset input actions
            gameStore.input.actions.menuConfirm = false;
            gameStore.input.actions.menuMovement = EMovement.halt;
            gameStore.input.actions.togglePause = false;
        }

        { // Work on all events which occurred during the last frame
            for (const event of inputEvents) {
                gameStore.input.keyStates[event.key] = event.type;

                if (event.type == EKeyState.Down) {
                    switch (event.key) {
                        case 'w':
                        case 'W': {
                            gameStore.input.actions.leftPaddleMovement = EMovement.up;
                            gameStore.input.actions.menuMovement = EMovement.up;
                            break;
                        }
                        case 'ArrowUp': {
                            gameStore.input.actions.rightPaddleMovement = EMovement.up;
                            gameStore.input.actions.menuMovement = EMovement.up;
                            break;
                        }
                        case 's':
                        case 'S': {
                            gameStore.input.actions.leftPaddleMovement = EMovement.down;
                            gameStore.input.actions.menuMovement = EMovement.down;
                            break;
                        }
                        case 'ArrowDown': {
                            gameStore.input.actions.rightPaddleMovement = EMovement.down;
                            gameStore.input.actions.menuMovement = EMovement.down;
                            break;
                        }
                        case 'Enter': {
                            gameStore.input.actions.menuConfirm = true;
                            break;
                        }
                        case 'Escape': {
                            gameStore.input.actions.togglePause = true;
                            break;
                        }
                    }
                } else {
                    switch (event.key) {
                        case 'w':
                        case 'W': {
                            gameStore.input.actions.leftPaddleMovement = EMovement.halt;
                            break;
                        }
                        case 'ArrowUp': {
                            gameStore.input.actions.rightPaddleMovement = EMovement.halt;
                            break;
                        }
                        case 's':
                        case 'S': {
                            gameStore.input.actions.leftPaddleMovement = EMovement.halt;
                            break;
                        }
                        case 'ArrowDown': {
                            gameStore.input.actions.rightPaddleMovement = EMovement.halt;
                            break;
                        }
                    }
                }
            }
        }

        // Clear event queue
        inputEvents.length = 0;
    })
    .build();

// @ts-ignore
hmr:if (import.meta.hot) {
    // @ts-ignore
    import.meta.hot.accept(mod => hmrSwapSystem(mod[Object.getOwnPropertyNames(mod)[0]]));
}
