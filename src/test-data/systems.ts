import {Actions, createSystem} from "../system/system.ts";
import {C1} from "./components.ts";
import {Write} from "../query/query.ts";
import {queryComponents} from "../ecs/ecs-query.ts";
import type {ISystemActions} from "../world/actions.spec.ts";

export const S1 = (handler?: (c1:C1)=>void) => createSystem({
    query: queryComponents({ c1: Write(C1) })
}).withRunFunction(({query}) => {
    return query.execute(({c1}) => handler?.(c1));
}).build();

export const S2 = (handler?: (actions: ISystemActions)=>void) => createSystem({ actions: Actions })
    .withRunFunction(({actions}) => handler?.(actions))
    .build();
