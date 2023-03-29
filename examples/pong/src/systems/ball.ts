import {createSystem, hmrSwapSystem, queryComponents, Read, WithTag, Write, WriteResource} from "sim-ecs";
import {Velocity} from "../components/velocity.ts";
import {Collision} from "../components/collision.ts";
import {EWallSide, EWallType, Wall} from "../components/wall.ts";
import {Paddle} from "../components/paddle.ts";
import {ScoreBoard} from "../models/score-board.ts";
import {Position} from "../components/position.ts";
import {defaultBallPositionX, defaultBallPositionY} from "../prefabs/game.ts";
import {ETags} from "../models/tags.ts";


export const BallSystem = createSystem({
    scoreBoard: WriteResource(ScoreBoard),
    query: queryComponents({
        _ball: WithTag(ETags.ball),
        collisionData: Read(Collision),
        pos: Write(Position),
        vel: Write(Velocity),
    })
})
    .withName('BallSystem')
    .withRunFunction(({scoreBoard, query}) => {
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

// @ts-ignore
hmr:if (import.meta.hot) {
    // @ts-ignore
    import.meta.hot.accept(mod => hmrSwapSystem(mod[Object.getOwnPropertyNames(mod)[0]]));
}
