import {ETags} from "../models/tags";
import {Collision} from "../components/collision";
import {Position} from "../components/position";
import {Shape} from "../components/shape";
import {Velocity} from "../components/velocity";
import {EPaddleSide, Paddle} from "../components/paddle";
import {defaultBallPositionX, defaultBallPositionY, defaultBallVelocityX, defaultBallVelocityY} from "./game";
import {CTagMarker} from 'sim-ecs';

export const savablePrefab = [
    { // Ball
        [CTagMarker]: [ETags.ball, ETags.save],
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
        [CTagMarker]: [ETags.save],
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
        [CTagMarker]: [ETags.save],
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