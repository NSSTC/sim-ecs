import {EPaddleSide, type Paddle} from "../components/paddle.ts";
import {type Shape} from "../components/shape.ts";
import {type UIItem} from "../components/ui-item.ts";
import {type Position} from "../components/position.ts";
import {type Collision} from "../components/collision.ts";
import {EWallSide, EWallType, type Wall} from "../components/wall.ts";
import {CResourceMarker, CResourceMarkerValue} from "sim-ecs";
import {type ScoreBoard} from "../models/score-board.ts";


export const defaultBallPositionX = 0.49;
export const defaultBallPositionY = 0.49;
export const defaultBallVelocityX = 0.005 / 2;
export const defaultBallVelocityY = 0.007 / 2;

// This could also be pure JSON, but in order to use TS types and have static checks it is recommended to write it as TS array.
export const gamePrefab = [
    { // Resources
        [CResourceMarker]: CResourceMarkerValue,
        ScoreBoard: {
            left: 0,
            right: 0,
        } satisfies ScoreBoard
    },
    { // Left wall
        Wall: {
            wallSide: EWallSide.Left,
            wallType: EWallType.Vertical,
        } satisfies Wall,
        Collision: {
            collisionObjects: [],
            occurred: false,
        } satisfies Collision,
        Position: {
            x: -1,
            y: 0,
        } satisfies Position,
        Shape: {
            color: 'black',
            dimensions: {
                width: 1,
                height: 1,
            },
        } satisfies Shape,
    },
    { // Right wall
        Wall: {
            wallSide: EWallSide.Right,
            wallType: EWallType.Vertical,
        } satisfies Wall,
        Collision: {
            collisionObjects: [],
            occurred: false,
        } satisfies Collision,
        Position: {
            x: 1,
            y: 0,
        } satisfies Position,
        Shape: {
            color: 'black',
            dimensions: {
                width: 1,
                height: 1,
            },
        } satisfies Shape,
    },
    { // Top wall
        Wall: {
            wallSide: EWallSide.None,
            wallType: EWallType.Horizontal,
        } satisfies Wall,
        Collision: {
            collisionObjects: [],
            occurred: false,
        } satisfies Collision,
        Position: {
            x: 0,
            y: -1,
        } satisfies Position,
        Shape: {
            color: 'black',
            dimensions: {
                width: 1,
                height: 1,
            },
        } satisfies Shape,
    },
    { // Bottom wall
        Wall: {
            wallSide: EWallSide.None,
            wallType: EWallType.Horizontal,
        } satisfies Wall,
        Collision: {
            collisionObjects: [],
            occurred: false,
        } satisfies Collision,
        Position: {
            x: 0,
            y: 1,
        } satisfies Position,
        Shape: {
            color: 'black',
            dimensions: {
                width: 1,
                height: 1,
            },
        } satisfies Shape,
    },
    { // Left points
        Paddle: {
            side: EPaddleSide.Left,
        } satisfies Paddle,
        UIItem: {
            caption: 'Points Left: {}',
            color: '#ddd',
            fontSize: 24,
        } satisfies UIItem,
        Position: {
            x: 0.1,
            y: 0.1,
        } satisfies Position,
    },
    { // Right points
        Paddle: {
            side: EPaddleSide.Right,
        } satisfies Paddle,
        UIItem: {
            caption: 'Points Right: {}',
            color: '#ddd',
            fontSize: 24,
        } satisfies UIItem,
        Position: {
            x: 0.1,
            y: 0.15,
        } satisfies Position,
    },
];
