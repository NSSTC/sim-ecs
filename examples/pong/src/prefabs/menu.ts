import {TPrefab} from "sim-ecs";
import {EActions} from "../app/actions";
import {Position} from "../components/position";
import {UIItem} from "../components/ui-item";

// This could also be pure JSON, but in order to use TS types and have static checks it is recommended to write it as TS array.
export const menuPrefab: TPrefab = [
    { // Title
        Position: <Position>{
            x: 0.05,
            y: 0.05,
        },
        UIItem: <UIItem>{
            caption: 'PONG',
            color: '#ddd',
            fontSize: 64,
        }
    },
    { // Sub title
        Position: <Position>{
            x: 0.05,
            y: 0.12,
        },
        UIItem: {
            caption: 'A sim-ecs usage demo',
            color: '#ddd',
            fontSize: 24,
        }
    },
    {
        Position: <Position>{
            x: 0.05,
            y: 0.2,
        },
        UIItem: <UIItem>{
            caption: 'How to play: Left paddle: W/S ; Right paddle: Up/Down ; Pause: Escape',
            color: '#ddd',
            fontSize: 24,
        }
    },
    {
        Position: <Position>{
            x: 0.05,
            y: 0.24,
        },
        UIItem: <UIItem>{
            caption: 'The game will be saved upon pausing!',
            color: '#ddd',
            fontSize: 24,
        }
    },
    {
        Position: <Position>{
            x: 0.15,
            y: 0.35,
        },
        UIItem: <UIItem>{
            action: EActions.Play,
            active: true,
            color: '#ddd',
            caption: 'Play',
            fontSize: 32,
        },
    },
    {
        Position: <Position>{
            x: 0.15,
            y: 0.4,
        },
        UIItem: <UIItem>{
            action: EActions.Continue,
            color: '#ddd',
            caption: 'Continue',
            fontSize: 32,
        },
    },
    {
        Position: <Position>{
            x: 0.15,
            y: 0.45,
        },
        UIItem: <UIItem>{
            action: EActions.Exit,
            color: '#ddd',
            caption: 'Exit',
            fontSize: 32,
        },
    },
];
