import {UIItem} from "../components/ui-item";
import {Position} from "../components/position";

// This could also be pure JSON, but in order to use TS types and have static checks it is recommended to write it as TS array.
export const pausePrefab = [
    {
        Position: <Position>{
            x: 0.05,
            y: 0.02,
        },
        UIItem: <UIItem>{
            caption: '❚❚ PAUSE',
            color: '#ddd',
            fontSize: 64,
        }
    },
];
