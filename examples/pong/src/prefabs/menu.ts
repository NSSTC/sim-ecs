import {TPrefab} from "../ecs";
import {EActions} from "../app/actions";

// This could also be pure JSON, but in order to use TS types and have static checks it is recommended to write it as TS array.
export const menuPrefab: TPrefab = [
    {
        MenuButton: {
            action: EActions.Play,
            caption: 'Play',
            left: 100,
            top: 200,
        },
    },
    {
        MenuButton: {
            action: EActions.Exit,
            caption: 'Exit',
            left: 100,
            top: 250,
        },
    },
];
