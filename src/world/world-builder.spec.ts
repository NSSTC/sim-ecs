import type {TObjectProto} from "../_.spec.ts";
import type {ISerDeOperations} from "../serde/serde.spec.ts";
import type {ISyncPoint} from "../scheduler/pipeline/sync-point.spec.ts";
import type {IScheduler} from "../scheduler/scheduler.spec.ts";
import type {IIStateProto} from "../state/state.spec.ts";
import type {IPreptimeWorld} from "./preptime/preptime-world.spec.ts";

export interface IObjectRegistrationOptions {
    serDe: Readonly<ISerDeOperations>
}

export interface IResourceRegistrationOptions extends IObjectRegistrationOptions{
    constructorArgs: ReadonlyArray<unknown>
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
    c(Component: Readonly<TObjectProto>, options?: Readonly<IObjectRegistrationOptions>): IWorldBuilder

    /**
     * Alias for [withComponent]{@link IWorldBuilder#withComponent}
     * @param Component
     * @param options
     */
    component(Component: Readonly<TObjectProto>, options?: Readonly<IObjectRegistrationOptions>): IWorldBuilder

    /**
     * Alias for [withComponent]{@link IWorldBuilder#withComponent}
     * @param Components
     */
    components(...Components: ReadonlyArray<Readonly<TObjectProto>>): IWorldBuilder

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
    r(Resource: Readonly<TObjectProto>, options?: Readonly<Partial<IResourceRegistrationOptions>>): IWorldBuilder

    /**
     * Alias for [withResource]{@link IWorldBuilder#withResource}
     * @param Resource
     * @param options
     */
    resource(Resource: Readonly<TObjectProto>, options?: Readonly<Partial<IResourceRegistrationOptions>>): IWorldBuilder

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
    withComponent(Component: Readonly<TObjectProto>, options?: Readonly<IObjectRegistrationOptions>): IWorldBuilder

    /**
     * Register several components with default options in the world
     * @param Components
     */
    withComponents(...Components: ReadonlyArray<Readonly<TObjectProto>>): IWorldBuilder

    /**
     * Add a default scheduler
     * @param scheduler
     */
    withDefaultScheduler(scheduler: Readonly<IScheduler>): IWorldBuilder

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
    withResource(Resource: Readonly<TObjectProto>, options?: Readonly<Partial<IResourceRegistrationOptions>>): IWorldBuilder

    /**
     * Register several resources for serDe
     * @param Resources
     */
    withResources(Resources: ReadonlyArray<Readonly<TObjectProto>>): IWorldBuilder

    /**
     * Add a per-state custom scheduler
     * @param state
     * @param scheduler
     */
    withStateScheduler(state: Readonly<IIStateProto>, scheduler: Readonly<IScheduler>): IWorldBuilder

    /**
     * Create and add a per-state schedule
     * @param state
     * @param planner
     */
    withStateScheduling(state: Readonly<IIStateProto>, planner: (root: ISyncPoint) => void): IWorldBuilder
}
