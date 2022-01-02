import {Actions, ISystem, Storage, TSystemParameter, TSystemParameters} from "./system.spec";
import {ISystemBuilder, SystemBuilder} from "./system-builder";
import {IAccessQuery, IQuery, Query, TExistenceQuery} from "../query/query";
import {TObjectProto} from "../_.spec";
import {ISystemActions} from "../world.spec";
import {arrayReplace} from "../util";


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
    let runParameters = system.parameters;

    // I guess for now this is super simple, but it might become harder later on..?
    runParameters = arrayReplace(runParameters, Actions, actions);
    runParameters = arrayReplace(runParameters, Storage, new Map());

    return runParameters;
}
