import IWorld from "../world.spec";
import {TObjectProto} from "../_.spec";
import {ISerDeOperations} from "../serde/serde.spec";
import {ISyncPoint} from "../scheduler/pipeline/sync-point.spec";
import {IScheduler} from "../scheduler/scheduler.spec";

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
     * Give the world a name
     * @param name
     */
    withName(name: string): IWorldBuilder

    /**
     * Add a custom scheduler
     * @param scheduler
     */
    withScheduler(scheduler: IScheduler): IWorldBuilder

    /**
     * Add system to the world
     * @param planner
     */
    withScheduling(planner: (root: ISyncPoint) => void): IWorldBuilder
}
