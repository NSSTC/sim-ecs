import {TPrefab} from "../ecs";

// This could also be pure JSON, but in order to use TS types and have static checks it is recommended to write it as TS array.
export const pausePrefab: TPrefab = [
    {
        PauseItem: {},
        UIItem: {
            caption: '❚❚ PAUSE',
            color: '#ddd',
            fontSize: 64,
            left: 100,
            top: 100,
        }
    },
];
