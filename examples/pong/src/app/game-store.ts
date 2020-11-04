import { EKeyState } from '../systems/input'
import {IState} from "../ecs";

export enum EMovement {
    up,
    halt,
    down,
}

export class GameStore {
    backToMenu = false
    ctx!: CanvasRenderingContext2D
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
    pause = false
    readonly pointLimit = 10
    pointsLeft = 0
    pointsRight = 0
    popState = false
    pushState?: IState
}
