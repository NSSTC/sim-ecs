import {Actions, createSystem, Query, Read, Storage, Write} from "sim-ecs";
import {EMovement, GameStore} from "../models/game-store";
import {EPaddleSide, Paddle} from "../components/paddle";
import {Position} from "../components/position";
import {Velocity} from "../components/velocity";
import {Shape} from "../components/shape";
import {PaddleTransforms} from "../models/paddle-transforms";
import {Dimensions} from "../models/dimensions";
import {Transform} from "../models/transform";
import {GameState} from "../states/game";



export const PaddleSystem = createSystem(
    Actions,
    Storage<{ gameStore: GameStore, ctx: CanvasRenderingContext2D, paddleTrans: PaddleTransforms }>(),
    new Query({
        paddle: Read(Paddle),
        pos: Read(Position),
        shape: Read(Shape),
        vel: Write(Velocity)
    }),
)
    .runInStates(GameState)
    .withSetupFunction((actions, storage) => {
        storage.gameStore = actions.getResource(GameStore);
        storage.ctx = actions.getResource(CanvasRenderingContext2D);
        storage.paddleTrans = actions.getResource(PaddleTransforms);
    })
    .withRunFunction((actions, storage, query) => {
        return query.execute(({paddle, pos, shape, vel}) => {
            updateTransformationResource(paddle.side, pos, shape.dimensions, storage.paddleTrans);
            updateVelocity(
                pos,
                vel,
                shape.dimensions.height ?? shape.dimensions.width,
                storage.gameStore.lastFrameDeltaTime,
                paddle.side == EPaddleSide.Left
                    ? storage.gameStore.input.actions.leftPaddleMovement
                    : storage.gameStore.input.actions.rightPaddleMovement
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
