import {ISystem, TSystemParameter, TSystemParameters} from "./system.spec";
import {ISystemBuilder, SystemBuilder} from "./system-builder";
import {IAccessQuery, IQuery, Query, TExistenceQuery} from "../query/query";
import {TObjectProto} from "../_.spec";


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

// todo
export function getSystemRunParameters(system: ISystem): TSystemParameters{
    return system.parameters;
}
