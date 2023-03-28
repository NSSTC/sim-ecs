import {EActions} from "../app/actions.ts";
import {type Position} from "../components/position.ts";
import {type UIItem} from "../components/ui-item.ts";

// This could also be pure JSON, but in order to use TS types and have static checks it is recommended to write it as TS array.
export const menuPrefab = [
    { // Title
        Position: {
            x: 0.05,
            y: 0.05,
        } satisfies Position,
        UIItem: {
            caption: 'PONG',
            color: '#ddd',
            fontSize: 64,
        } satisfies UIItem,
    },
    { // Sub title
        Position: {
            x: 0.05,
            y: 0.12,
        } satisfies Position,
        UIItem: {
            caption: 'A sim-ecs usage demo',
            color: '#ddd',
            fontSize: 24,
        } satisfies UIItem,
    },
    {
        Position: {
            x: 0.05,
            y: 0.2,
        } satisfies Position,
        UIItem: {
            caption: 'How to play: Left paddle: W/S ; Right paddle: Up/Down ; Pause: Escape',
            color: '#ddd',
            fontSize: 24,
        } satisfies UIItem,
    },
    {
        Position: {
            x: 0.05,
            y: 0.24,
        } satisfies Position,
        UIItem: {
            caption: 'The game will be saved upon pausing!',
            color: '#ddd',
            fontSize: 24,
        } satisfies UIItem,
    },
    {
        Position: {
            x: 0.15,
            y: 0.35,
        } satisfies Position,
        UIItem: {
            action: EActions.Play,
            active: true,
            color: '#ddd',
            caption: 'Play',
            fontSize: 32,
        } satisfies UIItem,
    },
    {
        Position: {
            x: 0.15,
            y: 0.4,
        } satisfies Position,
        UIItem: {
            action: EActions.Continue,
            color: '#ddd',
            caption: 'Continue',
            fontSize: 32,
        } satisfies UIItem,
    },
    {
        Position: {
            x: 0.15,
            y: 0.45,
        } satisfies Position,
        UIItem: {
            action: EActions.Exit,
            color: '#ddd',
            caption: 'Exit',
            fontSize: 32,
        } satisfies UIItem,
    },
];
