import IWorld from "./world.spec";
import IEntity from "./entity.spec";
import {TComponentProto} from './component.spec';

// @ts-ignore
export type TComponentQuery = { [component: TComponentProto]: boolean };

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
     * Define and freeze the used components
     * @param componentQuery
     */
    setComponentQuery(componentQuery: TComponentQuery): ISystem

    /**
     * Update components during a dispatch
     * @param world
     * @param entities
     * @param deltaTime
     */
    update(world: IWorld, entities: IEntity[], deltaTime: number): Promise<void>
}

export type TSystemProto = { new(): ISystem };
export default ISystem;
