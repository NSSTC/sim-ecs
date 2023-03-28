import type {TObjectProto} from "../_.spec.ts";
import {
    CIdMarker,
    CResourceMarker,
    CResourceMarkerValue,
    CTagMarker,
} from "./serde.spec.ts";
import type {
    IDeserializerOutput,
    ISerDe,
    ISerDeDataSet,
    ISerDeOperations,
    ISerDeOptions,
    TCustomDeserializer,
    TDeserializer,
    TSerializer
} from "./serde.spec.ts";
import type {ISerialFormat} from "./serial-format.spec.ts";
import {SerialFormat} from "./serial-format.ts";
import type {IEntity, TEntityId, TTag} from "../entity/entity.spec.ts";
import {getDefaultDeserializer, getDefaultSerializer} from "./default-handlers.ts";
import {Entity} from "../entity/entity.ts";
import type {TEntity} from "./_.ts";
import {Reference} from "./referencing.ts";
import {EReferenceType} from "./referencing.spec.ts";
import {getEntity} from "../ecs/ecs-entity.ts";

export * from "./serde.spec.ts";

export class SerDe implements ISerDe {
    protected typeHandlers = new Map<string, Readonly<ISerDeOperations>>();

    deserialize(data: Readonly<ISerialFormat>, options?: Readonly<ISerDeOptions<TDeserializer>>): ISerDeDataSet {
        const finalOptions: typeof options = {
            useDefaultHandler: options?.useDefaultHandler ?? true,
            useRegisteredHandlers: options?.useRegisteredHandlers ?? true,
            fallbackHandler: options?.fallbackHandler,
        };
        const entities: IEntity[] = [];
        let resources: Record<string, Readonly<object>> = {};

        {
            const components = [];
            const objectsWithRefs: Array<Readonly<object>> = [];
            const tags: TTag[] = [];
            let component;
            let deserializerOut: IDeserializerOutput;
            let id: TEntityId | undefined = undefined;
            let serialComponentData: unknown;
            let serialComponentName: string;
            let serialEntity: TEntity;
            let tag: TTag;

            { // Resources are stored in the first TEntity
                const serialResources = data.shift();

                if (serialResources) {
                    if (serialResources[CResourceMarker] !== CResourceMarkerValue) {
                        data.unshift(serialResources);
                    } else {
                        delete serialResources[CResourceMarker];
                        resources = Object.fromEntries(Array.from(Object.entries(serialResources))
                            .map(([type, data]) => {
                                if (finalOptions.useRegisteredHandlers && this.typeHandlers.has(type)) {
                                    deserializerOut = this.typeHandlers.get(type)!.deserializer(data);
                                } else if (finalOptions.useDefaultHandler) {
                                    deserializerOut = getDefaultDeserializer(finalOptions.fallbackHandler)(type, data);
                                } else {
                                    throw new Error(`There is no deserializer for "${type}"!`);
                                }

                                if (deserializerOut.containsRefs) {
                                    objectsWithRefs.push(deserializerOut.data);
                                }

                                return [type, data ? deserializerOut.data : deserializerOut.type];
                            })
                        );
                    }
                }
            }

            for (serialEntity of data) {
                for ([serialComponentName, serialComponentData] of Object.entries(serialEntity)) {
                    if (finalOptions.useRegisteredHandlers && this.typeHandlers.has(serialComponentName)) {
                        deserializerOut = this.typeHandlers.get(serialComponentName)!.deserializer(serialComponentData);
                        components.push(deserializerOut.data);

                        if (deserializerOut.containsRefs) {
                            objectsWithRefs.push(deserializerOut.data);
                        }
                    } else if (serialComponentName == CIdMarker) {
                        id = serialComponentData as string;
                    } else if (serialComponentName == CTagMarker) {
                        if (!Array.isArray(serialComponentData)) {
                            throw new Error('Expected array of tags for the hash identifier!');
                        }

                        for (tag of serialComponentData) {
                            if (!['string', 'number'].includes(typeof tag)) {
                                throw new Error('Tags must be of type string or number!');
                            }

                            tags.push(tag);
                        }
                    } else if (finalOptions.useDefaultHandler) {
                        deserializerOut = getDefaultDeserializer(finalOptions.fallbackHandler)(serialComponentName, serialComponentData);
                        components.push(deserializerOut.data);

                        if (deserializerOut.containsRefs) {
                            objectsWithRefs.push(deserializerOut.data);
                        }
                    } else {
                        throw new Error(`There is no deserializer for "${serialComponentName}"!`);
                    }
                }

                {
                    const entity = new Entity(id);

                    for (tag of tags) {
                        entity.addTag(tag);
                    }

                    for (component of components) {
                        entity.addComponent(component);
                    }

                    entities.push(entity);
                }

                tags.length = 0;
                components.length = 0;
            }

            {
                let component: Record<string, any>;
                for (component of objectsWithRefs) {
                    dereferenceComponentRefs(component);
                }
            }
        }

        return {
            entities: entities.values(),
            resources,
        };
    }

    getRegisteredTypeHandlers(): IterableIterator<[string, Readonly<ISerDeOperations>]> {
        return this.typeHandlers.entries();
    }

    registerTypeHandler(Type: Readonly<TObjectProto>, deserializer: TCustomDeserializer, serializer: TSerializer): void {
        if (this.typeHandlers.has(Type.name)) {
            throw new Error(`The type "${Type.name}" was already registered!`);
        }

        this.typeHandlers.set(Type.name, {
            deserializer,
            serializer,
        });
    }

    serialize(data: Readonly<ISerDeDataSet>, options?: Readonly<ISerDeOptions<TSerializer>>): SerialFormat {
        const finalOptions: Readonly<typeof options> = {
            useDefaultHandler: options?.useDefaultHandler ?? true,
            useRegisteredHandlers: options?.useRegisteredHandlers ?? true,
            fallbackHandler: options?.fallbackHandler,
        };
        const outData = new SerialFormat();

        const serialize = (chunk: IterableIterator<object> | Array<object>, collector: Record<string, unknown>) => {
            let item;
            let serialData;

            for (item of chunk) {
                if (finalOptions.useRegisteredHandlers && this.typeHandlers.has(item.constructor.name)) {
                    serialData = this.typeHandlers.get(item.constructor.name)!.serializer(item);
                } else if (finalOptions.useDefaultHandler) {
                    serialData = getDefaultSerializer(finalOptions.fallbackHandler)(item);
                }

                collector[item.constructor.name] = serialData;
                serialData = undefined;
            }
        };

        { // Resources are index 0!
            const resources: Readonly<TEntity> = {
                [CResourceMarker]: CResourceMarkerValue,
            };

            if (data.resources !== undefined) {
                serialize(Object.values(data.resources), resources);
            }

            outData.push(resources);
        }

        {
            let entity: IEntity;
            let serialEntity: TEntity;

            for (entity of data.entities) {
                serialEntity = {
                    [CIdMarker]: entity.id,
                };

                serialize(entity.getComponents(), serialEntity);

                {
                    const tags: TTag[] = Array.from(entity.getTags());

                    if (tags.length > 0) {
                        serialEntity[CTagMarker] = tags;
                    }
                }

                outData.push(serialEntity);
            }
        }

        return outData;
    }

    unregisterTypeHandler(Type: Readonly<TObjectProto>): void {
        this.typeHandlers.delete(Type.name);
    }
}

const dereferenceComponentRefs = (component: /* mut */ Record<string, unknown>) => {
    let key: string;
    let value: unknown;

    for ([key, value] of Object.entries(component)) {
        if (value instanceof Reference) {
            switch (value.type) {
                case EReferenceType.Entity: {
                    component[key] = getEntity(value.id);
                    break;
                }
                default: {
                    component[key] = value.id;
                }
            }
        } else if (typeof value == 'object' && value !== null) {
            dereferenceComponentRefs(value as Record<string, unknown>);
        }
    }
};
