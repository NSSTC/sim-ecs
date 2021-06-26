import {ISystemActions} from "./world.spec";
import {IAccessQuery, Query} from "./query";
import {TTypeProto} from "./_.spec";


export interface ISystem {
    query?: Query<IAccessQuery<TTypeProto<Object>>>

    /**
     * Called after dispatching or running a world
     * @param actions
     */
    destroy(actions: ISystemActions): void | Promise<void>

    /**
     * Run the system logic during a dispatch
     * @param actions
     */
    run(actions: ISystemActions): void | Promise<void>

    /**
     * Called before dispatching or running a world
     * @param actions
     */
    setup(actions: ISystemActions): void | Promise<void>
}

export type TSystemProto = { new(): ISystem };
