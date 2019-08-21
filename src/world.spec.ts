import {IEntity} from "./entity.spec";
import IEntityBuilder from "./entity_builder.spec";
import ISystem from "./system.spec";
import IState from "./state.spec";

export type TSystemNode = { system: ISystem, dependencies: ({ new(): ISystem })[]};

export interface IWorld {
    readonly systems: ISystem[]
    addEntity(entity: IEntity): IWorld
    addResource<T extends Object>(type: T | { new(): T }, ...args: any[]): IWorld
    buildEntity(): IEntityBuilder
    createEntity(): IEntity
    dispatch(state?: IState): void
    getResource<T extends Object>(type: { new(): T }): T
    maintain(): void
    registerSystem(system: ISystem, dependencies?: ({ new(): ISystem })[]): IWorld

    /**
     * Inserts a system without adding entities or sorting the dependency graph
     * Must call world.maintain() afterwards!
     * @param system
     * @param dependencies
     */
    registerSystemQuick(system: ISystem, dependencies?: ({ new(): ISystem })[]): IWorld
}

export default IWorld;
