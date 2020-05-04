import {Entity, IEntity} from "./entity";
import {ISaveFormat, TComponent, TDeserializer, TEntity, TSaveFormat} from "./save-format.spec";

export class SaveFormat implements ISaveFormat {
    protected entities: TSaveFormat = [];

    static fromJSON(json: string): SaveFormat {
        const save = new SaveFormat();
        save.entities = JSON.parse(json);
        return save;
    }

    constructor(data: { entities?: IterableIterator<IEntity> } = {}) {
        if (data.entities) {
            let entity;
            let components: TComponent[];
            let component;

            for (entity of data.entities) {
                components = [];

                for (component of entity.getComponents()) {
                    components.push([component.constructor.name, component]);
                }

                this.entities.push(components);
            }
        }
    }

    getEntities(deserializer: TDeserializer): Iterable<IEntity> {
        const self = this;
        return {
            *[Symbol.iterator](): Iterator<IEntity> {
                let entity;
                let entityData: TEntity;
                let component: TComponent;

                for (entityData of self.entities) {
                    entity = new Entity();

                    for (component of entityData) {
                        entity.addComponent(deserializer(component[0], component[1]));
                    }

                    yield entity;
                }
            }
        };
    }

    toJSON(): string {
        return JSON.stringify(this.entities);
    }
}
