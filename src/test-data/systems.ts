import {Actions, createSystem} from "../system/system";
import {C1} from "./components";
import {Write} from "../query/query";
import {queryComponents} from "../ecs/ecs-query";
import type {ISystemActions} from "../world/actions.spec";

export const S1 = (handler?: (c1:C1)=>void) => createSystem({
    query: queryComponents({ c1: Write(C1) })
}).withRunFunction(({query}) => {
    return query.execute(({c1}) => handler?.(c1));
}).build();

export const S2 = (handler?: (actions: ISystemActions)=>void) => createSystem({ actions: Actions })
    .withRunFunction(({actions}) => handler?.(actions))
    .build();
