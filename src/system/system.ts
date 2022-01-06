import {
    Actions,
    ISystem,
    ISystemResource,
    Storage,
    TSystemParameter,
    TSystemParameters
} from "./system.spec";
import {ISystemBuilder, SystemBuilder} from "./system-builder";
import {IAccessQuery, IQuery, Query, TExistenceQuery} from "../query/query";
import {TObjectProto} from "../_.spec";
import {ISystemActions} from "../world.spec";
import {systemResourceTypeSym} from "./_";


export * from "./system.spec";

export function createSystem<T extends TSystemParameters>(...parameters: T): ISystemBuilder<T> {
    return new SystemBuilder(parameters);
}

export function getQueriesFromSystem(system: ISystem): IQuery<IAccessQuery<TObjectProto> | TExistenceQuery<TObjectProto>>[] {
    const queries: IQuery<[any]>[] = [];
    let param: TSystemParameter;

    for (param of system.parameters) {
        if (param instanceof Query) {
            queries.push(param);
        }
    }

    return queries;
}

export function getSystemRunParameters(system: ISystem, actions: ISystemActions): TSystemParameters {
    let runParameters = [];

    for (const param of system.parameters) {
        if (param == Actions) {
            runParameters.push(actions);
        } else if (param == Storage) {
            runParameters.push(param);
        } else if (Object.getOwnPropertySymbols(param).includes(systemResourceTypeSym)) {
            runParameters.push(actions.getResource((param as ISystemResource<TObjectProto>)[systemResourceTypeSym]))
        } else {
            runParameters.push(param);
        }
    }

    return runParameters;
}
