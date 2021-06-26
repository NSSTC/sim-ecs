import {ISystemActions} from "./world";
import {ISystem} from "./system.spec";
import {IAccessQuery, Query} from "./query";
import {TTypeProto} from "./_.spec";

export * from './system.spec';

export abstract class System implements ISystem {
    readonly query?: Query<IAccessQuery<TTypeProto<Object>>>;

    destroy(actions: ISystemActions): void | Promise<void> {}

    abstract run(actions: ISystemActions): void | Promise<void>;

    setup(actions: ISystemActions): void | Promise<void> {}
}
