import {type UIItem} from "../components/ui-item";
import {type Position} from "../components/position";

// This could also be pure JSON, but in order to use TS types and have static checks it is recommended to write it as TS array.
export const pausePrefab = [
    {
        Position: {
            x: 0.05,
            y: 0.02,
        } satisfies Position,
        UIItem: {
            caption: '❚❚ PAUSE',
            color: '#ddd',
            fontSize: 64,
        } satisfies UIItem,
    },
];
