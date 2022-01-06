import {createSystem, Query, Read, WithTag, Write, WriteResource} from "sim-ecs";
import {Velocity} from "../components/velocity";
import {Collision} from "../components/collision";
import {EWallSide, EWallType, Wall} from "../components/wall";
import {Paddle} from "../components/paddle";
import {ScoreBoard} from "../models/score-board";
import {Position} from "../components/position";
import {defaultBallPositionX, defaultBallPositionY} from "../prefabs/game";
import {ETags} from "../models/tags";


export const BallSystem = createSystem(
    WriteResource(ScoreBoard),
    new Query({
        _ball: WithTag(ETags.ball),
        collisionData: Read(Collision),
        pos: Write(Position),
        vel: Write(Velocity),
    })
)
    .withRunFunction((scoreBoard, query) => {
        let wallCollisionHorizontal = false;
        let wallCollisionVertical = EWallSide.None;
        let paddleCollision = false;

        return query.execute(({collisionData, pos, vel}) => {
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
                        scoreBoard.left++;
                    } else {
                        scoreBoard.right++;
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
        });
    })
    .build();
