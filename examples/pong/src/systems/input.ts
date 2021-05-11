import {ISystemActions, NoData, System} from "sim-ecs";
import {EMovement, GameStore} from "../models/game-store";

export enum EKeyState {
    Down,
    Up,
}

interface IInputEvent {
    key: string
    type: EKeyState
}

export class InputSystem extends System<NoData> {
    readonly SystemDataType = NoData;

    gameStore!: GameStore;
    inputEvents: IInputEvent[] = [];

    setup(actions: ISystemActions) {
        this.gameStore = actions.getResource(GameStore);

        window.addEventListener('keydown', event => this.inputEvents.push({key: event.key, type: EKeyState.Down}));
        window.addEventListener('keyup', event => this.inputEvents.push({key: event.key, type: EKeyState.Up}));
    }

    run() {
        { // Reset input actions
            this.gameStore.input.actions.menuConfirm = false;
            this.gameStore.input.actions.menuMovement = EMovement.halt;
            this.gameStore.input.actions.togglePause = false;
        }

        { // Work on all events which occurred during the last frame
            for (const event of this.inputEvents) {
                this.gameStore.input.keyStates[event.key] = event.type;

                if (event.type == EKeyState.Down) {
                    switch (event.key) {
                        case 'w':
                        case 'W': {
                            this.gameStore.input.actions.leftPaddleMovement = EMovement.up;
                            this.gameStore.input.actions.menuMovement = EMovement.up;
                            break;
                        }
                        case 'ArrowUp': {
                            this.gameStore.input.actions.rightPaddleMovement = EMovement.up;
                            this.gameStore.input.actions.menuMovement = EMovement.up;
                            break;
                        }
                        case 's':
                        case 'S': {
                            this.gameStore.input.actions.leftPaddleMovement = EMovement.down;
                            this.gameStore.input.actions.menuMovement = EMovement.down;
                            break;
                        }
                        case 'ArrowDown': {
                            this.gameStore.input.actions.rightPaddleMovement = EMovement.down;
                            this.gameStore.input.actions.menuMovement = EMovement.down;
                            break;
                        }
                        case 'Enter': {
                            this.gameStore.input.actions.menuConfirm = true;
                            break;
                        }
                        case 'Escape': {
                            this.gameStore.input.actions.togglePause = true;
                            break;
                        }
                    }
                } else {
                    switch (event.key) {
                        case 'w':
                        case 'W': {
                            this.gameStore.input.actions.leftPaddleMovement = EMovement.halt;
                            break;
                        }
                        case 'ArrowUp': {
                            this.gameStore.input.actions.rightPaddleMovement = EMovement.halt;
                            break;
                        }
                        case 's':
                        case 'S': {
                            this.gameStore.input.actions.leftPaddleMovement = EMovement.halt;
                            break;
                        }
                        case 'ArrowDown': {
                            this.gameStore.input.actions.rightPaddleMovement = EMovement.halt;
                            break;
                        }
                    }
                }
            }
        }

        // Clear event queue
        this.inputEvents.length = 0;
    }
}
