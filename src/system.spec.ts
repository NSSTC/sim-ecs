import IWorld from "./world.spec";
import IEntity from "./entity.spec";
import { IComponent } from './component.spec';

// @ts-ignore
export type TComponentQuery = { [component: { new(): IComponent }]: boolean };

export interface ISystem {
    readonly componentQuery: TComponentQuery
    readonly entities: IEntity[]

    canUseEntity(entity: IEntity): boolean
    setComponentQuery(componentQuery: TComponentQuery): ISystem
    update(world: IWorld, entities: IEntity[], deltaTime: number): void
}

export default ISystem;
