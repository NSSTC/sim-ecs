import {ETags} from "../models/tags";
import {Collision} from "../components/collision";
import {Position} from "../components/position";
import {Shape} from "../components/shape";
import {Velocity} from "../components/velocity";
import {EPaddleSide, Paddle} from "../components/paddle";
import {defaultBallPositionX, defaultBallPositionY, defaultBallVelocityX, defaultBallVelocityY} from "./game";

export const savablePrefab = [
    { // Ball
        '#': [ETags.ball, ETags.save],
        Collision: <Collision>{},
        Position: <Position>{
            x: defaultBallPositionX,
            y: defaultBallPositionY,
        },
        Shape: <Shape>{
            color: 'red',
            dimensions: {
                width: 0.01,
            },
        },
        Velocity: <Velocity>{
            x: defaultBallVelocityX,
            y: defaultBallVelocityY,
        }
    },
    { // Left paddle
        '#': [ETags.save],
        Collision: <Collision>{},
        Paddle: <Paddle>{
            side: EPaddleSide.Left,
        },
        Shape: <Shape>{
            color: '#ddd',
            dimensions: {
                height: 0.15,
                width: 0.005,
            },
        }
    },
    { // Right paddle
        '#': [ETags.save],
        Collision: <Collision>{},
        Paddle: <Paddle>{
            side: EPaddleSide.Right,
        },
        Shape: <Shape>{
            color: '#ddd',
            dimensions: {
                height: 0.15,
                width: 0.005,
            },
        }
    },
];