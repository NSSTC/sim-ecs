import IWorld from "../world.spec";
import {TObjectProto} from "../_.spec";
import {ISerDeOperations} from "../serde/serde.spec";
import {ISyncPoint} from "../scheduler/pipeline/sync-point.spec";
import {IScheduler} from "../scheduler";
import {IIStateProto} from "../state.spec";

export interface IComponentRegistrationOptions {
    serDe: ISerDeOperations
}

export interface IWorldBuilder {
    /**
     * Build the execution unit
     */
    build(): IWorld

    /**
     * Register a component in the world
     * @param Component
     * @param options
     */
    withComponent(Component: TObjectProto, options?: IComponentRegistrationOptions): IWorldBuilder

    /**
     * Register several components with default options in the world
     * @param Components
     */
    withComponents(...Components: TObjectProto[]): IWorldBuilder

    /**
     * Add a default scheduler
     * @param scheduler
     */
    withDefaultScheduler(scheduler: IScheduler): IWorldBuilder

    /**
     * Give the world a name
     * @param name
     */
    withName(name: string): IWorldBuilder

    /**
     * Create and add a default schedule
     * @param planner
     */
    withDefaultScheduling(planner: (root: ISyncPoint) => void): IWorldBuilder

    /**
     * Add a per-state custom scheduler
     * @param state
     * @param scheduler
     */
    withStateScheduler(state: IIStateProto, scheduler: IScheduler): IWorldBuilder

    /**
     * Create and add a per-state schedule
     * @param state
     * @param planner
     */
    withStateScheduling(state: IIStateProto, planner: (root: ISyncPoint) => void): IWorldBuilder
}
