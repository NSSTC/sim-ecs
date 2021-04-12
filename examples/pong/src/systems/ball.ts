import {ISystemActions, Read, System, SystemData, Write} from "sim-ecs";
import {GameStore} from "../models/game-store";
import {Position} from "../components/position";
import {Ball} from "../components/ball";
import {Direction} from "../components/direction";

class Data extends SystemData {
    readonly ball = Read(Ball)
    dir = Write(Direction)
    pos = Write(Position)
}

export class BallSystem extends System<Data> {
    readonly SystemDataType = Data;
    canvas!: HTMLCanvasElement;
    gameStore!: GameStore;

    setup(actions: ISystemActions) {
        this.gameStore = actions.getResource(GameStore);
        this.canvas = this.gameStore.ctx.canvas;
    }

    run(dataSet: Set<Data>) {
        for (const {ball, dir, pos} of dataSet) {
            if (!this.gameStore.pause) {
                const normDir = dir.normalized();
                pos.x += normDir.x * this.gameStore.lastFrameDeltaTime * .8;
                pos.y += normDir.y * this.gameStore.lastFrameDeltaTime * .8;

                if (pos.y < 0) {
                    pos.y *= -1;
                    dir.y *= -1;
                }
                else if (pos.y > this.canvas.height - ball.size) {
                    pos.y = 2 * this.canvas.height - ball.size - pos.y;
                    dir.y *= -1;
                }
            }

            ball.draw(this.gameStore.ctx, pos);
        }
    }
}
