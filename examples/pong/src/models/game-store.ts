import { EKeyState } from '../systems/input'
import {IState, TStateProto} from "sim-ecs";

export enum EMovement {
    up,
    halt,
    down,
}

export class GameStore {
    continue = false
    currentState?: IState
    exit = false
    lastFrameDeltaTime = 0
    input: {
        actions: {
            leftPaddleMovement: EMovement
            menuConfirm: boolean
            menuMovement: EMovement
            togglePause: boolean
            rightPaddleMovement: EMovement
        }
        keyStates: {
            [key: string]: EKeyState | undefined
        }
    } = {
        actions: {
            leftPaddleMovement: EMovement.halt,
            menuConfirm: false,
            menuMovement: EMovement.halt,
            togglePause: false,
            rightPaddleMovement: EMovement.halt,
        },
        keyStates: {},
    }
    popState = false
    PushState?: TStateProto
}
