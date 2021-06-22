import {ISystemActions} from "./world";
import {ISystem} from "./system.spec";
import {IQuery} from "./query";

export * from './system.spec';

export abstract class System implements ISystem {
    abstract query: IQuery<any>;

    destroy(actions: ISystemActions): void | Promise<void> {}

    abstract run(actions: ISystemActions): void | Promise<void>;

    setup(actions: ISystemActions): void | Promise<void> {}
}
