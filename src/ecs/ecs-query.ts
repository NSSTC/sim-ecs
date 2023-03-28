import type {IAccessQuery, IComponentsQuery, IEntitiesQuery, TExistenceQuery} from "../query/query.spec.ts";
import {EntitiesQuery} from "../query/entities-query.ts";
import {ComponentsQuery} from "../query/components-query.ts";
import type {TObjectProto} from "../_.spec.ts";

export function queryComponents<DESC extends IAccessQuery<TObjectProto>>(query: Readonly<DESC>): IComponentsQuery<DESC> {
    return new ComponentsQuery(query);
}

export function queryEntities(...query: Readonly<TExistenceQuery<TObjectProto>>): IEntitiesQuery {
    return new EntitiesQuery(query);
}
