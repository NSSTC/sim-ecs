import {TPrefab} from "sim-ecs";
import {EPaddleSide, Paddle} from "../components/paddle";
import {Shape} from "../components/shape";
import {Ball} from "../components/ball";
import {Velocity} from "../components/velocity";
import {UIItem} from "../components/ui-item";
import {Position} from "../components/position";
import {Collision} from "../components/collision";
import {EWallType} from "../components/wall";

// This could also be pure JSON, but in order to use TS types and have static checks it is recommended to write it as TS array.
export const gamePrefab: TPrefab = [
    { // Left wall
        Wall: { wallType: EWallType.Vertical },
        Collision: <Collision>{},
        Position: <Position>{
            x: -1,
            y: 0,
        },
        Shape: <Shape>{
            color: 'black',
            dimensions: {
                width: 1,
                height: 1,
            },
        },
    },
    { // Right wall
        Wall: { wallType: EWallType.Vertical },
        Collision: <Collision>{},
        Position: <Position>{
            x: 1,
            y: 0,
        },
        Shape: <Shape>{
            color: 'black',
            dimensions: {
                width: 1,
                height: 1,
            },
        },
    },
    { // Top wall
        Wall: { wallType: EWallType.Horizontal },
        Collision: <Collision>{},
        Position: <Position>{
            x: 0,
            y: -1,
        },
        Shape: <Shape>{
            color: 'black',
            dimensions: {
                width: 1,
                height: 1,
            },
        },
    },
    { // Bottom wall
        Wall: { wallType: EWallType.Horizontal },
        Collision: <Collision>{},
        Position: <Position>{
            x: 0,
            y: 1,
        },
        Shape: <Shape>{
            color: 'black',
            dimensions: {
                width: 1,
                height: 1,
            },
        },
    },
    { // Ball
        Ball: <Ball>{},
        Collision: <Collision>{},
        Position: <Position>{
            x: 0.49,
            y: 0.49,
        },
        Shape: <Shape>{
            color: 'red',
            dimensions: {
                width: 0.01,
            },
        },
        Velocity: <Velocity>{
            x: 0.005,
            y: 0.007,
        }
    },
    { // Left paddle
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
    { // Left points
        Paddle: <Paddle>{
            side: EPaddleSide.Left,
        },
        UIItem: <UIItem>{
            caption: 'Points Left: {}',
            color: '#ddd',
            fontSize: 24,
        },
        Position: <Position>{
            x: 0.1,
            y: 0.1,
        },
    },
    { // Right points
        Paddle: <Paddle>{
            side: EPaddleSide.Right,
        },
        UIItem: <UIItem>{
            caption: 'Points Right: {}',
            color: '#ddd',
            fontSize: 24,
        },
        Position: <Position>{
            x: 0.1,
            y: 0.15,
        },
    },
];
