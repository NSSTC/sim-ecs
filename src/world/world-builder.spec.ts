import type {TObjectProto} from "../_.spec";
import type {ISerDeOperations} from "../serde/serde.spec";
import type {ISyncPoint} from "../scheduler/pipeline/sync-point.spec";
import type {IScheduler} from "../scheduler/scheduler.spec";
import type {IIStateProto} from "../state/state.spec";
import type {IPreptimeWorld} from "./preptime/preptime-world.spec";

export interface IObjectRegistrationOptions {
    serDe: ISerDeOperations
}

export interface IWorldBuilder {
    /**
     * Build the execution unit
     */
    build(): IPreptimeWorld

    /**
     * Alias for [withComponent]{@link IWorldBuilder#withComponent}
     * @param Component
     * @param options
     */
    c(Component: TObjectProto, options?: IObjectRegistrationOptions): IWorldBuilder

    /**
     * Alias for [withComponent]{@link IWorldBuilder#withComponent}
     * @param Component
     * @param options
     */
    component(Component: TObjectProto, options?: IObjectRegistrationOptions): IWorldBuilder

    /**
     * Alias for [withComponent]{@link IWorldBuilder#withComponent}
     * @param Components
     */
    components(...Components: TObjectProto[]): IWorldBuilder

    /**
     * Alias for [withName]{@link IWorldBuilder#withName}
     * @param name
     */
    name(name: string): IWorldBuilder

    /**
     * Alias for [withResource]{@link IWorldBuilder#withResource}
     * @param Resource
     * @param options
     */
    r(Resource: TObjectProto, options?: IObjectRegistrationOptions): IWorldBuilder

    /**
     * Alias for [withResource]{@link IWorldBuilder#withResource}
     * @param Resource
     * @param options
     */
    resource(Resource: TObjectProto, options?: IObjectRegistrationOptions): IWorldBuilder

    /**
     * Transform the root sync point
     * @param updater
     */
    updateRootSyncPoint(updater: (root: ISyncPoint) => void): IWorldBuilder

    /**
     * Register a component in the world
     * @param Component
     * @param options
     */
    withComponent(Component: TObjectProto, options?: IObjectRegistrationOptions): IWorldBuilder

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
     * Create and add a default schedule
     * @param planner
     */
    withDefaultScheduling(planner: (root: ISyncPoint) => void): IWorldBuilder

    /**
     * Give the world a name
     * @param name
     */
    withName(name: string): IWorldBuilder

    /**
     * Register settings for a resource type (for serDe)
     * @param Resource
     * @param options
     */
    withResource(Resource: TObjectProto, options?: IObjectRegistrationOptions): IWorldBuilder

    /**
     * Register several resources for serDe
     * @param Resources
     */
    withResources(Resources: TObjectProto[]): IWorldBuilder

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
