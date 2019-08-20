import IWorld from "./world.spec";
import IEntity from "./entity.spec";

export interface ISystem {
    readonly entities: IEntity[]
    // todo: this should be a frozen resource which cannot change after instantiation
    canUseEntity(entity: IEntity): boolean
    update(world: IWorld, entities: IEntity[], deltaTime: number): void
}

export default ISystem;
