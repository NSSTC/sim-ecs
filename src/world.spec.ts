import {IEntity} from "./entity.spec";
import IEntityBuilder from "./entity_builder.spec";
import ISystem, {TSystemProto} from "./system.spec";
import IState from "./state.spec";
import {TTypeProto} from "./_.spec";

export type TSystemNode = { system: ISystem, dependencies: TSystemProto[]};

export interface IWorld {
    readonly systems: ISystem[]
    addEntity(entity: IEntity): IWorld
    addResource<T extends Object>(type: T | TTypeProto<T>, ...args: any[]): IWorld
    buildEntity(): IEntityBuilder
    createEntity(): IEntity
    dispatch(state?: IState): void
    getResource<T extends Object>(type: TTypeProto<T>): T
    maintain(): void
    registerSystem(system: ISystem, dependencies?: TSystemProto[]): IWorld

    /**
     * Inserts a system without adding entities or sorting the dependency graph
     * Must call world.maintain() afterwards!
     * @param system
     * @param dependencies
     */
    registerSystemQuick(system: ISystem, dependencies?: TSystemProto[]): IWorld
}

export type TWorldProto = { new(): IWorld };
export default IWorld;
