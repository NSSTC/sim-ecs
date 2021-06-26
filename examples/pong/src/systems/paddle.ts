import {ISystemActions, Query, Read, System, Write} from "sim-ecs";
import {EMovement, GameStore} from "../models/game-store";
import {EPaddleSide, Paddle} from "../components/paddle";
import {Position} from "../components/position";
import {Velocity} from "../components/velocity";
import {Shape} from "../components/shape";
import {PaddleTransforms} from "../models/paddle-transforms";
import {Dimensions} from "../models/dimensions";
import {Transform} from "../models/transform";


export class PaddleSystem extends System {
    query = new Query({
        paddle: Read(Paddle),
        pos: Read(Position),
        shape: Read(Shape),
        vel: Write(Velocity)
    });

    gameStore!: GameStore;
    ctx!: CanvasRenderingContext2D;
    paddleTrans!: PaddleTransforms;

    setup(actions: ISystemActions) {
        this.gameStore = actions.getResource(GameStore);
        this.ctx = actions.getResource(CanvasRenderingContext2D);
        this.paddleTrans = actions.getResource(PaddleTransforms);
    }

    updateTransformationResource(side: EPaddleSide, pos: Position, dim: Dimensions) {
        const update = (trans: Transform) => {
            trans.position.x = pos.x;
            trans.position.y = pos.y;
            trans.dimensions.height = dim.height;
            trans.dimensions.width = dim.width;
        }

        switch (side) {
            case EPaddleSide.Left: {
                update(this.paddleTrans.left);
                break;
            }
            case EPaddleSide.Right: {
                update(this.paddleTrans.right);
                break;
            }
        }
    }

    updateVelocity(pos: Position, vel: Velocity, paddleHeight: number, deltaTime: number, movement: EMovement) {
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

    run(actions: ISystemActions) {
        for (const {paddle, pos, shape, vel} of this.query.iter()) {
            this.updateTransformationResource(paddle.side, pos, shape.dimensions);
            this.updateVelocity(
                pos,
                vel,
                shape.dimensions.height ?? shape.dimensions.width,
                this.gameStore.lastFrameDeltaTime,
                paddle.side == EPaddleSide.Left
                    ? this.gameStore.input.actions.leftPaddleMovement
                    : this.gameStore.input.actions.rightPaddleMovement
            );
        }
    }
}
