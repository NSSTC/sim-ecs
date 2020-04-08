import {ISystemWorld} from "./world.spec";
import IEntity from "./entity.spec";
import {TObjectProto} from "./_.spec";

export enum EComponentRequirement {
    READ,
    UNSET,
    WRITE,
}

export type TComponentQuery = [TObjectProto, EComponentRequirement][];

// todo: implement a way to prepare a system before a run for things it cannot prepare in the constructor
export interface ISystem {
    /**
     * Components which are used by this system
     */
    readonly componentQuery: TComponentQuery

    /**
     * Entities which are associated with this system because of their components
     */
    readonly entities: IEntity[]

    /**
     * Have the system check weather it should use an entity.
     * @param entity
     */
    canUseEntity(entity: IEntity): boolean

    /**
     * Remove all associated entities
     */
    clearEntities(): void

    /**
     * Define and freeze the used components
     * @param componentQuery
     */
    setComponentQuery(componentQuery: TComponentQuery): ISystem

    /**
     * Update components during a dispatch
     * @todo pass an object (which was derived from a Map<TComponentProto, Component>) as single parameter instead
     *    in order to optimize the trampoline away and only pass one ref
     *    This Map should contain all components which were queried, and READ-marked components should be read-only (ideally)
     * @param world
     * @param entities
     * @param deltaTime
     */
    update(world: ISystemWorld, entities: IEntity[], deltaTime: number): Promise<void>
}

export type TSystemProto = { new(): ISystem };
export default ISystem;
