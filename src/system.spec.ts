import {ISystemActions} from "./world.spec";
import {IAccessQuery, Query} from "./query/query";
import {TObjectProto} from "./_.spec";
import {IIStateProto} from "./state.spec";


export interface ISystem {
    readonly query?: Query<IAccessQuery<TObjectProto>>
    readonly states?: IIStateProto[]

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

export interface IISystemProto { new(): ISystem }
