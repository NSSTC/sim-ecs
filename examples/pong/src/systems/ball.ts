import {ISystemActions, Read, System, SystemData, With, Write} from "sim-ecs";
import {Ball} from "../components/ball";
import {Velocity} from "../components/velocity";
import {PaddleTransforms} from "../models/paddle-transforms";
import {Collision} from "../components/collision";
import {EWallSide, EWallType, Wall} from "../components/wall";
import {Paddle} from "../components/paddle";
import {ScoreBoard} from "../models/score-board";

class Data extends SystemData {
    readonly _ball = With(Ball)
    readonly collisionData = Read(Collision)
    vel = Write(Velocity)
}

export class BallSystem extends System<Data> {
    readonly SystemDataType = Data;
    canvas!: HTMLCanvasElement;
    paddleTrans!: PaddleTransforms;
    scoreBoard!: ScoreBoard;

    setup(actions: ISystemActions) {
        this.canvas = actions.getResource(CanvasRenderingContext2D).canvas;
        this.paddleTrans = actions.getResource(PaddleTransforms);
        this.scoreBoard = actions.getResource(ScoreBoard);
    }

    run(dataSet: Set<Data>) {
        for (const {vel, collisionData} of dataSet) {
            if (collisionData.occurred) {
                for (const obj of collisionData.collisionObjects) {
                    if (obj.hasComponent(Wall)) {
                        if (obj.getComponent(Wall)!.wallType == EWallType.Horizontal) {
                            vel.y *= -1;
                        } else {
                            // Point for one side, restart
                            switch (obj.getComponent(Wall)!.wallSide) {
                                case EWallSide.Left: {
                                    this.scoreBoard.left++;
                                    break;
                                }
                                case EWallSide.None: {
                                    break;
                                }
                                case EWallSide.Right: {
                                    this.scoreBoard.right++;
                                    break;
                                }
                            }

                            //
                        }
                    } else if (obj.hasComponent(Paddle)) {
                        vel.x *= -1;
                    }
                }
            }
        }
    }
}
