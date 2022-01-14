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
import {systemEventReaderSym, systemEventWriterSym, systemResourceTypeSym} from "./_";
import {World} from "../world";


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

export function getSystemRunParameters(system: ISystem, world: World): TSystemParameterDesc {
    let runParameters = {};

    for (const param of Object.entries(system.parameterDesc)) {
        if (param[1] == Actions) {
            Object.defineProperty(runParameters, param[0], {
                configurable: false,
                enumerable: true,
                writable: false,
                value: world.systemWorld,
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
                value: world.getResource((param[1] as ISystemResource<TObjectProto>)[systemResourceTypeSym]),
            });
        } else if (Object.getOwnPropertySymbols(param[1]).includes(systemEventReaderSym)) {
            Object.defineProperty(runParameters, param[0], {
                configurable: false,
                enumerable: true,
                writable: false,
                value: world.eventBus.createReader((param[1] as any)[systemEventReaderSym]),
            });
        } else if (Object.getOwnPropertySymbols(param[1]).includes(systemEventWriterSym)) {
            Object.defineProperty(runParameters, param[0], {
                configurable: false,
                enumerable: true,
                writable: false,
                value: world.eventBus.createWriter(),
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
