import {Entity, IEntity} from "./entity";
import {
    ISaveFormat,
    TComponent,
    TCustomDeserializer,
    TDeserializer,
    TEntity,
    TSaveFormat,
    TSerializer
} from "./save-format.spec";
import {TObjectProto} from "./_.spec";

export const defaultDeserializer = function (customDeserializer?: TDeserializer): TDeserializer {
    return (constructorName: string, data: unknown) => {
        switch (constructorName.toLowerCase()) {
            case 'array': {
                if (!Array.isArray(data)) {
                    throw new Error(`Cannot deserialize Array with data of type ${typeof data}! Array expected!`);
                }

                return data as Array<unknown>;
            }

            case 'date': {
                if (typeof data != 'string') {
                    throw new Error(`Cannot deserialize Date with data of type ${typeof data}! String expected!`);
                }

                return new Date(data);
            }

            case 'map': {
                if (!Array.isArray(data)) {
                    throw new Error(`Cannot deserialize Map with data of type ${typeof data}! Array of arrays expected!`);
                }

                return new Map(data as [unknown, unknown][]);
            }

            case 'object': {
                if (typeof data != 'object') {
                    throw new Error(`Cannot deserialize Object with data of type ${typeof data}! Object expected!`);
                }

                return data as Object;
            }

            case 'set': {
                if (!Array.isArray(data)) {
                    throw new Error(`Cannot deserialize Set with data of type ${typeof data}! Array expected!`);
                }

                return new Set(data as Array<unknown>);
            }

            case 'string': {
                if (typeof data != 'string') {
                    throw new Error(`Cannot deserialize String with data of type ${typeof data}! String expected!`);
                }

                return data;
            }
        }

        if (!customDeserializer) {
            throw new Error(`Missing deserializer for "${constructorName}"!`);
        }

        return customDeserializer(constructorName, data);
    }
};

export class SaveFormat implements ISaveFormat {
    protected entities: TSaveFormat = [];
    protected serde: Map<string, {serializer?: TSerializer, deserializer: TCustomDeserializer}> = new Map();

    static fromJSON(json: string): SaveFormat {
        const save = new SaveFormat();
        save.loadJSON(json);
        return save;
    }

    constructor(data: { entities?: IterableIterator<IEntity> } = {}) {
        if (data.entities) {
            this.setEntities(data.entities);
        }
    }

    loadJSON(json: string) {
        this.entities = JSON.parse(json);
    }

    getEntities(deserializer?: TDeserializer): Iterable<IEntity> {
        const self = this;
        return {
            *[Symbol.iterator](): Iterator<IEntity> {
                let entity;
                let entityData: TEntity;
                let component: TComponent;

                for (entityData of self.entities) {
                    entity = new Entity();

                    for (component of entityData) {
                        if (self.serde.has(component[0])) {
                            entity.addComponent(self.serde.get(component[0])!.deserializer(component[1]));
                        }
                        else if (deserializer) {
                            entity.addComponent(deserializer(component[0], component[1]));
                        }
                        else throw new Error(`No deserializer provided for component of type "${component[0]}"!`);
                    }

                    yield entity;
                }
            }
        };
    }

    registerComponent(Component: TObjectProto, deserializer: TCustomDeserializer, serializer?: TSerializer) {
        if (this.serde.has(Component.name)) throw new Error(`Component ${Component.name} was already registered!`);
        this.serde.set(Component.name, { serializer, deserializer });
    }

    setEntities(entities: IterableIterator<IEntity>) {
        let entity;
        let components: TComponent[];
        let component;

        this.entities.length = 0;

        for (entity of entities) {
            components = [];

            for (component of entity.getComponents()) {
                components.push([component.constructor.name, component]);
            }

            this.entities.push(components);
        }
    }

    toJSON(serializer?: TSerializer): string {
        // todo: implement serializer
        return JSON.stringify(this.entities);
    }
}
