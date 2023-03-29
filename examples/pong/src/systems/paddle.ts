import {createSystem, hmrSwapSystem, queryComponents, Read, ReadResource, Write} from "sim-ecs";
import {EMovement, GameStore} from "../models/game-store.ts";
import {EPaddleSide, Paddle} from "../components/paddle.ts";
import {Position} from "../components/position.ts";
import {Velocity} from "../components/velocity.ts";
import {Shape} from "../components/shape.ts";
import {PaddleTransforms} from "../models/paddle-transforms.ts";
import {Dimensions} from "../models/dimensions.ts";
import {Transform} from "../models/transform.ts";

export const PaddleSystem = createSystem({
    gameStore: ReadResource(GameStore),
    paddleTrans: ReadResource(PaddleTransforms),
    query: queryComponents({
        paddle: Read(Paddle),
        pos: Read(Position),
        shape: Read(Shape),
        vel: Write(Velocity)
    }),
})
    .withName('PaddleSystem')
    .withRunFunction(({gameStore, paddleTrans, query}) => {
        return query.execute(({paddle, pos, shape, vel}) => {
            updateTransformationResource(paddle.side, pos, shape.dimensions, paddleTrans);
            updateVelocity(
                pos,
                vel,
                shape.dimensions.height ?? shape.dimensions.width,
                gameStore.lastFrameDeltaTime,
                paddle.side == EPaddleSide.Left
                    ? gameStore.input.actions.leftPaddleMovement
                    : gameStore.input.actions.rightPaddleMovement
            );
        });
    })
    .build();


function updateTransformationResource(side: EPaddleSide, pos: Position, dim: Dimensions, paddleTrans: PaddleTransforms) {
    const update = (trans: Transform) => {
        trans.position.x = pos.x;
        trans.position.y = pos.y;
        trans.dimensions.height = dim.height;
        trans.dimensions.width = dim.width;
    }

    switch (side) {
        case EPaddleSide.Left: {
            update(paddleTrans.left);
            break;
        }
        case EPaddleSide.Right: {
            update(paddleTrans.right);
            break;
        }
    }
}

function updateVelocity(pos: Position, vel: Velocity, paddleHeight: number, deltaTime: number, movement: EMovement) {
    switch (movement) {
        case EMovement.down: {
            if (pos.y + paddleHeight >= 1) {
                pos.y = 1 - paddleHeight;
            } else {
                vel.y = (1 - paddleHeight) * deltaTime / 500;
            }

            break;
        }
        case EMovement.halt: {
            vel.y = 0;
            break;
        }
        case EMovement.up: {
            if (pos.y <= 0) {
                pos.y = 0;
            } else {
                vel.y = -((1 - paddleHeight) * deltaTime / 500);
            }

            break;
        }
    }
}

// @ts-ignore
hmr:if (import.meta.hot) {
    // @ts-ignore
    import.meta.hot.accept(mod => hmrSwapSystem(mod[Object.getOwnPropertyNames(mod)[0]]));
}
