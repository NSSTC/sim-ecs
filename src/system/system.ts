import type {
    ISystem,
    ISystemResource,
    TSystemParameter,
    TSystemParameterDesc,
} from "./system.spec.ts";
import {Actions, Storage} from "./system.spec.ts";
import {SystemBuilder} from "./system-builder.ts";
import {Query} from "../query/query.ts";
import type {TObjectProto} from "../_.spec.ts";
import {systemEventReaderSym, systemEventWriterSym, systemResourceTypeSym} from "./_.ts";
import type {ISystemBuilder} from "./system-builder.spec.ts";
import {type IRuntimeWorld} from "../world/runtime/runtime-world.ts";
import {SimECSSystemAddResourceEvent} from "../events/internal-events.ts";


export * from "./system.spec.ts";

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

            world.eventBus.publish(new SimECSSystemAddResourceEvent(
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
