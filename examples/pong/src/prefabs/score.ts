import {TPrefab} from "../ecs";

// This could also be pure JSON, but in order to use TS types and have static checks it is recommended to write it as TS array.
export const scorePrefab: TPrefab = [
    {
        ScoreItem: {},
        UIItem: {
            caption: '{side} side wins {score}!',
            color: '#ddd',
            fontSize: 64,
            left: 100,
            top: 100,
        }
    },
];
