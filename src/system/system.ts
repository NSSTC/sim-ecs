import type {
    ISystem,
    ISystemResource,
    TSystemParameter,
    TSystemParameterDesc,
} from "./system.spec";
import {Actions, Storage} from "./system.spec";
import {SystemBuilder} from "./system-builder";
import {Query} from "../query/query";
import type {TObjectProto} from "../_.spec";
import {systemEventReaderSym, systemEventWriterSym, systemResourceTypeSym} from "./_";
import type {ISystemBuilder} from "./system-builder.spec";
import {type IRuntimeWorld} from "../world/runtime/runtime-world";
import {SimECSSystemAddResource} from "../events/internal-events";


export * from "./system.spec";

export function createSystem<T extends TSystemParameterDesc>(parameterDesc: Readonly<T>): ISystemBuilder<T> {
    return new SystemBuilder(parameterDesc);
}

export function getQueriesFromSystem(system: Readonly<ISystem>): Array<Readonly<Query<unknown, unknown>>> {
    const queries: Query<unknown, unknown>[] = [];
    let param: TSystemParameter;

    for (param of Object.values(system.parameterDesc)) {
        if (param instanceof Query) {
            queries.push(param);
        }
    }

    return queries;
}

export function getSystemRunParameters(system: Readonly<ISystem>, world: Readonly<IRuntimeWorld>): TSystemParameterDesc {
    let runParameters = {};

    for (const [paramName, paramDesc] of Object.entries(system.parameterDesc)) {
        if (paramDesc == Actions) {
            Object.defineProperty(runParameters, paramName, {
                configurable: false,
                enumerable: true,
                writable: false,
                value: world.systemActions,
            });
        } else if (paramDesc == Storage) {
            Object.defineProperty(runParameters, paramName, {
                configurable: false,
                enumerable: true,
                writable: false,
                value: paramDesc,
            });
        } else if (Object.getOwnPropertySymbols(paramDesc).includes(systemResourceTypeSym)) {
            const resourceType = (paramDesc as ISystemResource<TObjectProto>)[systemResourceTypeSym];
            Object.defineProperty(runParameters, paramName, {
                configurable: false,
                enumerable: true,
                writable: true,
                value: world.getResource(resourceType),
            });

            world.eventBus.publish(new SimECSSystemAddResource(
                system,
                paramName,
                resourceType,
            ));
        } else if (Object.getOwnPropertySymbols(paramDesc).includes(systemEventReaderSym)) {
            Object.defineProperty(runParameters, paramName, {
                configurable: false,
                enumerable: true,
                writable: false,
                value: world.eventBus.createReader((paramDesc as any)[systemEventReaderSym]),
            });
        } else if (Object.getOwnPropertySymbols(paramDesc).includes(systemEventWriterSym)) {
            Object.defineProperty(runParameters, paramName, {
                configurable: false,
                enumerable: true,
                writable: false,
                value: world.eventBus.createWriter(),
            });
        } else {
            Object.defineProperty(runParameters, paramName, {
                configurable: false,
                enumerable: true,
                writable: false,
                value: paramDesc,
            });
        }
    }

    return runParameters;
}
