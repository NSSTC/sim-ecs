import {IEntity} from "./entity.spec";
import IEntityBuilder from "./entity_builder.spec";
import ISystem from "./system.spec";
import IState from "./state.spec";

export interface IWorld {
    readonly systems: ISystem[]
    addEntity(entity: IEntity): IWorld
    buildEntity(): IEntityBuilder
    createEntity(): IEntity
    dispatch(state?: IState): void
    maintain(): void
    registerSystem(system: ISystem): IWorld
}

export default IWorld;
