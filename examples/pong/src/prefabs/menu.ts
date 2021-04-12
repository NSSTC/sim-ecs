import {TPrefab} from "sim-ecs";
import {EActions} from "../app/actions";

// This could also be pure JSON, but in order to use TS types and have static checks it is recommended to write it as TS array.
export const menuPrefab: TPrefab = [
    {
        MenuItem: {},
        UIItem: {
            caption: 'PONG',
            color: '#ddd',
            fontSize: 64,
            left: 100,
            top: 100,
        }
    },
    {
        MenuItem: {},
        UIItem: {
            caption: 'A sim-ecs usage demo',
            color: '#ddd',
            fontSize: 24,
            left: 100,
            top: 150,
        }
    },
    {
        MenuItem: {},
        UIItem: {
            caption: 'How to play: Left paddle: W/S  Right paddle: Up/Down',
            color: '#ddd',
            fontSize: 24,
            left: 100,
            top: 190,
        }
    },
    {
        MenuItem: {},
        UIItem: {
            action: EActions.Play,
            color: '#ddd',
            caption: 'Play',
            fontSize: 32,
            left: 120,
            top: 270,
        },
    },
    {
        MenuItem: {},
        UIItem: {
            action: EActions.Continue,
            color: '#ddd',
            caption: 'Continue',
            fontSize: 32,
            left: 120,
            top: 320,
        },
    },
    {
        MenuItem: {},
        UIItem: {
            action: EActions.Exit,
            color: '#ddd',
            caption: 'Exit',
            fontSize: 32,
            left: 120,
            top: 370,
        },
    },
];
