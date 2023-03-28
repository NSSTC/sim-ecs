import {ETags} from "../models/tags.ts";
import {type Collision} from "../components/collision.ts";
import {type Position} from "../components/position.ts";
import {type Shape} from "../components/shape.ts";
import {type Velocity} from "../components/velocity.ts";
import {EPaddleSide, type Paddle} from "../components/paddle.ts";
import {defaultBallPositionX, defaultBallPositionY, defaultBallVelocityX, defaultBallVelocityY} from "./game.ts";
import {CTagMarker} from "sim-ecs";

export const savablePrefab = [
    { // Ball
        [CTagMarker]: [ETags.ball, ETags.save],
        Collision: {
            collisionObjects: [],
            occurred: false,
        } satisfies Collision,
        Position: {
            x: defaultBallPositionX,
            y: defaultBallPositionY,
        } satisfies Position,
        Shape: {
            color: 'red',
            dimensions: {
                width: 0.01,
            },
        } satisfies Shape,
        Velocity: {
            x: defaultBallVelocityX,
            y: defaultBallVelocityY,
        } satisfies Velocity,
    },
    { // Left paddle
        [CTagMarker]: [ETags.save],
        Collision: {
            collisionObjects: [],
            occurred: false,
        } satisfies Collision,
        Paddle: {
            side: EPaddleSide.Left,
        } satisfies Paddle,
        Shape: {
            color: '#ddd',
            dimensions: {
                height: 0.15,
                width: 0.005,
            },
        } satisfies Shape,
    },
    { // Right paddle
        [CTagMarker]: [ETags.save],
        Collision: {
            collisionObjects: [],
            occurred: false,
        } satisfies Collision,
        Paddle: {
            side: EPaddleSide.Right,
        } satisfies Paddle,
        Shape: {
            color: '#ddd',
            dimensions: {
                height: 0.15,
                width: 0.005,
            },
        } satisfies Shape,
    },
];