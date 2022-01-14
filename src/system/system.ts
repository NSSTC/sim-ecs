import {
    Actions,
    ISystem,
    ISystemResource,
    Storage,
    TSystemParameter,
    TSystemParameterDesc,
} from "./system.spec";
import {ISystemBuilder, SystemBuilder} from "./system-builder";
import {IQuery, Query} from "../query";
import {TObjectProto} from "../_.spec";
import {ISystemActions} from "../world.spec";
import {systemResourceTypeSym} from "./_";


export * from "./system.spec";

export function createSystem<T extends TSystemParameterDesc>(parameterDesc: T): ISystemBuilder<T> {
    return new SystemBuilder(parameterDesc);
}

export function getQueriesFromSystem(system: ISystem): IQuery<unknown, unknown>[] {
    const queries: IQuery<unknown, unknown>[] = [];
    let param: TSystemParameter;

    for (param of Object.values(system.parameterDesc)) {
        if (param instanceof Query) {
            queries.push(param);
        }
    }

    return queries;
}

export function getSystemRunParameters(system: ISystem, actions: ISystemActions): TSystemParameterDesc {
    let runParameters = {};

    for (const param of Object.entries(system.parameterDesc)) {
        if (param[1] == Actions) {
            Object.defineProperty(runParameters, param[0], {
                configurable: false,
                enumerable: true,
                writable: false,
                value: actions,
            });
        } else if (param[1] == Storage) {
            Object.defineProperty(runParameters, param[0], {
                configurable: false,
                enumerable: true,
                writable: false,
                value: param[1],
            });
        } else if (Object.getOwnPropertySymbols(param[1]).includes(systemResourceTypeSym)) {
            Object.defineProperty(runParameters, param[0], {
                configurable: false,
                enumerable: true,
                writable: false,
                value: actions.getResource((param[1] as ISystemResource<TObjectProto>)[systemResourceTypeSym]),
            });
        } else {
            Object.defineProperty(runParameters, param[0], {
                configurable: false,
                enumerable: true,
                writable: false,
                value: param[1],
            });
        }
    }

    return runParameters;
}
