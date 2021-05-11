import {ISystemActions, Read, System, SystemData, With, Write} from "sim-ecs";
import {Ball} from "../components/ball";
import {Velocity} from "../components/velocity";
import {PaddleTransforms} from "../models/paddle-transforms";
import {Collision} from "../components/collision";
import {EWallSide, EWallType, Wall} from "../components/wall";
import {Paddle} from "../components/paddle";
import {ScoreBoard} from "../models/score-board";
import {Position} from "../components/position";
import {defaultBallPositionX, defaultBallPositionY} from "../prefabs/game";

class Data extends SystemData {
    readonly _ball = With(Ball)
    readonly collisionData = Read(Collision)
    pos = Write(Position)
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
        let wallCollisionHorizontal = false;
        let wallCollisionVertical = EWallSide.None;
        let paddleCollision = false;

        for (const {collisionData, pos, vel} of dataSet) {
            if (collisionData.occurred) {
                for (const obj of collisionData.collisionObjects) {
                    if (obj.hasComponent(Wall)) {
                        if (obj.getComponent(Wall)!.wallType == EWallType.Horizontal) {
                            wallCollisionHorizontal = true;
                        } else {
                            wallCollisionVertical = obj.getComponent(Wall)!.wallSide;
                        }
                    } else if (obj.hasComponent(Paddle)) {
                        paddleCollision = true;
                    }
                }

                if (paddleCollision) {
                    vel.x *= -1;
                }

                if (!paddleCollision && wallCollisionVertical != EWallSide.None) {
                    // Point for one side, restart
                    if (wallCollisionVertical == EWallSide.Left) {
                        this.scoreBoard.left++;
                    } else {
                        this.scoreBoard.right++;
                    }

                    pos.x = defaultBallPositionX;
                    pos.y = defaultBallPositionY;
                    vel.x *= -1;
                    vel.y *= Math.random() > .5 ? 1 : -1;
                }

                if (wallCollisionHorizontal) {
                    vel.y *= -1;
                }
            }
        }
    }
}
