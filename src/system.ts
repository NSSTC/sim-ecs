import {ISystemActions} from "./world";
import {IISystemProto, ISystem} from "./system.spec";
import {IAccessQuery, Query} from "./query";
import {TObjectProto, TTypeProto} from "./_.spec";
import {IIStateProto} from "./state";

export * from './system.spec';

export abstract class System implements ISystem {
    readonly query?: Query<IAccessQuery<TObjectProto>>;
    readonly states?: IIStateProto[];

    destroy(actions: ISystemActions): void | Promise<void> {}

    abstract run(actions: ISystemActions): void | Promise<void>;

    setup(actions: ISystemActions): void | Promise<void> {}
}

export interface ISystemProto extends IISystemProto { new(): System }
