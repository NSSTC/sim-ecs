import {Entity} from "./entity";
import {EntityBuilder} from "./entity_builder";
import IWorld from "./world.spec";
import IEntity from "./entity.spec";
import IEntityBuilder from "./entity_builder.spec";
import ISystem from "./system.spec";
import {IState, State} from "./state";

export * from './world.spec';

export class World implements IWorld {
    protected defaultState = new State();
    protected entities: IEntity[] = [];
    protected lastDispatch = 0;

    get systems(): ISystem[] {
        return this.defaultState.systems;
    }

    addEntity(entity: IEntity): IWorld {
        if (!this.entities.includes(entity)) {
            entity.setWorld(this);
            this.entities.push(entity);
        }

        return this;
    }

    buildEntity(): IEntityBuilder {
        return new EntityBuilder(this);
    }

    createEntity(): Entity {
        const entity = new Entity();
        this.entities.push(entity);
        return entity;
    }

    dispatch(state?: IState): void {
        const currentTime = Date.now();

        if (!state) {
            state = this.defaultState;
        }

        if (this.lastDispatch === 0) {
            this.lastDispatch = currentTime;
        }

        for (let system of state.systems) {
            system.update(this, system.entities, currentTime - this.lastDispatch);
        }

        this.lastDispatch = currentTime;
    }

    maintain(): void {
        for (let entity of this.entities) {
            entity._updateSystems(this);
        }
    }

    registerSystem(system: ISystem): IWorld {
        if (!this.defaultState.systems.includes(system)) {
            this.defaultState.systems.push(system);
            for (let entity of this.entities) {
                entity._updateSystem(this, system);
            }
        }

        return this;
    }
}
