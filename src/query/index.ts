import {IAccessQuery, IComponentsQuery, IEntitiesQuery, TExistenceQuery} from "./query.spec";
import {TObjectProto} from "../../dist/_.spec";
import {EntitiesQuery} from "./entities-query";
import {ComponentsQuery} from "./components-query";

export * from "./query";

export function queryComponents<DESC extends IAccessQuery<TObjectProto>>(query: DESC): IComponentsQuery<DESC> {
    return new ComponentsQuery(query);
}

export function queryEntities(...query: TExistenceQuery<TObjectProto>): IEntitiesQuery {
    return new EntitiesQuery(query);
}
