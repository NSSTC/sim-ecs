import {Entity, IEntity, TTag} from "./entity";
import {
    CTagMarker,
    ISaveFormat,
    TComponent,
    TCustomDeserializer,
    TDeserializer,
    TEntity,
    TSaveFormat,
    TSerializer
} from "./save-format.spec";
import {TObjectProto} from "./_.spec";


export class SaveFormat implements ISaveFormat {
    protected entities: TSaveFormat = [];
    protected serde: Map<string, {proto: TObjectProto, serializer: TSerializer, deserializer: TCustomDeserializer}> = new Map();

    get rawEntities() {
        return Array.from(this.entities);
    }

    static fromJSON(json: string): SaveFormat {
        const save = new SaveFormat();
        save.loadJSON(json);
        return save;
    }

    constructor(data: { entities?: IterableIterator<IEntity> } = {}, serializer?: TSerializer) {
        if (data.entities) {
            this.setEntities(data.entities, serializer);
        }
    }

    deserialize(constructorName: string, rawComponent: unknown, fallbackDeserializer?: TDeserializer): Object {
        if (this.serde.has(constructorName)) {
            return this.serde.get(constructorName)!.deserializer(rawComponent);
        }
        else if (fallbackDeserializer) {
            return fallbackDeserializer(constructorName, rawComponent);
        }
        else throw new Error(`No deserializer provided for component of type "${constructorName}"! Did you forget to register the component?`);
    }

    loadJSON(json: string) {
        this.entities = JSON.parse(json);
    }

    getEntities(deserializer?: TDeserializer): Iterable<Entity> {
        const self = this;
        return {
            *[Symbol.iterator](): Iterator<Entity> {
                let entity;
                let entityData: TEntity;
                let component: TComponent;

                for (entityData of self.entities) {
                    entity = new Entity();

                    for (component of entityData) {
                        switch (component[0][0]) {
                            case CTagMarker: {
                                for (const tag of component[1] as TTag[]) {
                                    entity.addTag(tag);
                                }
                                break;
                            }
                            default: {
                                entity.addComponent(self.deserialize(component[0], component[1], deserializer));
                            }
                        }
                    }

                    yield entity;
                }
            }
        };
    }

    registerComponent(Component: TObjectProto, deserializer: TCustomDeserializer, serializer: TSerializer) {
        if (this.serde.has(Component.name)) throw new Error(`Component ${Component.name} was already registered!`);
        this.serde.set(Component.name, { proto: Component, serializer, deserializer });
    }

    setEntities(entities: IterableIterator<IEntity>, serializer?: TSerializer) {
        let entity;
        let components: TComponent[];
        let component;
        let saveComponent: string;
        let tag;

        this.entities.length = 0;

        for (entity of entities) {
            components = [];

            for (component of entity.getComponents()) {
                if (this.serde.has(component.constructor.name)) {
                    saveComponent = this.serde.get(component.constructor.name)!.serializer(component);
                }
                else if (serializer) {
                    saveComponent = serializer(component);
                }
                else throw new Error(`No serializer provided for component of type "${component.constructor.name}"!`);

                components.push([component.constructor.name, JSON.parse(saveComponent)]);
            }

            for (tag of entity.getTags()) {
                components.push([CTagMarker + tag.toString(), typeof tag]);
            }

            this.entities.push(components);
        }
    }

    toJSON(): string {
        return JSON.stringify(this.entities);
    }
}

export const getDefaultSerializer = function (customSerializer?: TSerializer): TSerializer {
    return (component: unknown) => {
        let componentName: string = typeof component;

        switch (typeof component) {
            case 'object': {
                if (component == null) {
                    return 'null';
                }

                componentName = component.constructor.name;

                switch (component.constructor.name) {
                    case 'Array':
                    case 'Date':
                    case 'Object':
                        return JSON.stringify(component);
                    case 'Map':
                    case 'Set':
                        return JSON.stringify(Array.from(component as Iterable<unknown>));
                }

                break;
            }
            case "string": {
                return JSON.stringify(component);
            }
        }

        if (!customSerializer) {
            throw new Error(`Missing serializer for "${componentName}"!`);
        }

        return customSerializer(component);
    };
}

export const getDefaultDeserializer = function (customDeserializer?: TDeserializer): TDeserializer {
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
