import {ISystemActions, Read, System, SystemData, Write} from "../ecs";
import {EMovement, GameStore} from "../models/game-store";
import {EPaddleSide, Paddle} from "../components/paddle";
import {Position} from "../components/position";

class Data extends SystemData {
    readonly paddle = Read(Paddle)
    pos = Write(Position)
}

export class PaddleSystem extends System<Data> {
    readonly SystemDataType = Data;
    gameStore!: GameStore;

    setup(actions: ISystemActions) {
        this.gameStore = actions.getResource(GameStore);
    }

    updatePosition(paddle: Paddle, pos: Position, deltaTime: number, movement: EMovement) {
        if (movement == EMovement.up) {
            pos.y -= Math.min(pos.y, deltaTime);
        }
        else if (movement == EMovement.down) {
            pos.y += Math.min(this.gameStore.ctx.canvas.height - pos.y - paddle.height, deltaTime);
        }
    }

    run(dataSet: Set<Data>) {
        for (const {paddle, pos} of dataSet) {
            paddle.draw(this.gameStore.ctx, pos.y);

            if (this.gameStore.pause) {
                continue;
            }

            this.updatePosition(paddle, pos, this.gameStore.lastFrameDeltaTime, paddle.side == EPaddleSide.Left
                ? this.gameStore.input.actions.leftPaddleMovement
                : this.gameStore.input.actions.rightPaddleMovement);
        }
    }
}
