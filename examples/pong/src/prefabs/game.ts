import {TPrefab} from "../ecs";
import {EPaddleSide} from "../components/paddle";

// This could also be pure JSON, but in order to use TS types and have static checks it is recommended to write it as TS array.
export const gamePrefab: TPrefab = [
    {
        Ball: {
            color: 'red',
            size: 20,
        }
    },
    {
        Paddle: {
            color: '#ddd',
            height: 100,
            side: EPaddleSide.Left,
            width: 10,
        }
    },
    {
        Paddle: {
            color: '#ddd',
            height: 100,
            side: EPaddleSide.Right,
            width: 10,
        }
    },
    {
        GameItem: {
            caption: 'Points Left:',
            color: '#ddd',
            fontSize: 24,
            left: 100,
            side: EPaddleSide.Left,
            top: 100,
        }
    },
    {
        GameItem: {
            caption: 'Points Right:',
            color: '#ddd',
            fontSize: 24,
            left: 100,
            side: EPaddleSide.Right,
            top: 150,
        }
    },
];
