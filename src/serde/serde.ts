import {TObjectProto} from "../_.spec";
import {
    CIdMarker,
    CTagMarker, IDeserializerOutput,
    ISerDe,
    ISerDeDataSet,
    ISerDeOperations,
    TCustomDeserializer,
    TDeserializer,
    TSerDeOptions,
    TSerializer
} from "./serde.spec";
import {ISerialFormat} from "./serial-format.spec";
import {SerialFormat} from "./serial-format";
import {IEntity, TTag} from "../entity.spec";
import {getDefaultDeserializer, getDefaultSerializer} from "./default-handlers";
import {Entity} from "../entity";
import {TEntity} from "./_";
import {Reference} from "./referencing";
import {EReferenceType} from "./referencing.spec";
import {getEntity} from "../ecs/ecs-entity";

export * from "./serde.spec";

export class SerDe implements ISerDe {
    protected typeHandlers = new Map<string, ISerDeOperations>();

    deserialize(data: ISerialFormat, options?: TSerDeOptions<TDeserializer>): ISerDeDataSet {
        const finalOptions: typeof options = {
            useDefaultHandler: options?.useDefaultHandler ?? true,
            useRegisteredHandlers: options?.useRegisteredHandlers ?? true,
            fallbackHandler: options?.fallbackHandler,
        };
        const entities: IEntity[] = [];
        const components = [];
        const componentsWithRefs: Object[] = [];
        const tags: TTag[] = [];
        let component;
        let deserializerOut: IDeserializerOutput;
        let id: string = '';
        let serialComponentData: unknown;
        let serialComponentName: string;
        let serialEntity: TEntity;
        let tag: TTag;

        for (serialEntity of data) {
            for ([serialComponentName, serialComponentData] of Object.entries(serialEntity)) {
                if (finalOptions.useRegisteredHandlers && this.typeHandlers.has(serialComponentName)) {
                    deserializerOut = this.typeHandlers.get(serialComponentName)!.deserializer(serialComponentData);
                    components.push(deserializerOut.data);

                    if (deserializerOut.containsRefs) {
                        componentsWithRefs.push(deserializerOut.data);
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
                        componentsWithRefs.push(deserializerOut.data);
                    }
                }
            }

            if (!id) {
                throw new Error('Serial format is missing an entity id!');
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
            const replaceRef = (obj: Record<string, any>) => {
                let key: string;
                let value;

                for ([key, value] of Object.entries(obj)) {
                    if (value instanceof Reference) {
                        switch (value.type) {
                            case EReferenceType.Entity: {
                                obj[key] = getEntity(value.id);
                                break;
                            }
                            default: {
                                obj[key] = value.id;
                            }
                        }
                    } else if (typeof value == 'object') {
                        replaceRef(value);
                    }
                }
            };

            let component;

            for (component of componentsWithRefs) {
                replaceRef(component);
            }
        }

        return {
            entities: entities.values(),
        };
    }

    getRegisteredTypeHandlers(): IterableIterator<[string, ISerDeOperations]> {
        return this.typeHandlers.entries();
    }

    registerTypeHandler(Type: TObjectProto, deserializer: TCustomDeserializer, serializer: TSerializer): void {
        if (this.typeHandlers.has(Type.name)) {
            throw new Error(`The type "${Type.name}" was already registered!`);
        }

        this.typeHandlers.set(Type.name, {
            deserializer,
            serializer,
        });
    }

    serialize(data: ISerDeDataSet, options?: TSerDeOptions<TSerializer>): SerialFormat {
        const finalOptions: typeof options = {
            useDefaultHandler: options?.useDefaultHandler ?? true,
            useRegisteredHandlers: options?.useRegisteredHandlers ?? true,
            fallbackHandler: options?.fallbackHandler,
        };
        const outData = new SerialFormat();
        let component: Object;
        let entity: IEntity;
        let serialData;
        let serialEntity: TEntity;
        let tags: TTag[];

        for (entity of data.entities) {
            serialEntity = {
                [CIdMarker]: entity.id,
            };

            for (component of entity.getComponents()) {
                if (finalOptions.useRegisteredHandlers && this.typeHandlers.has(component.constructor.name)) {
                    serialData = this.typeHandlers.get(component.constructor.name)!.serializer(component);
                } else if (finalOptions.useDefaultHandler) {
                    serialData = getDefaultSerializer(finalOptions.fallbackHandler)(component);
                }

                serialEntity[component.constructor.name] = serialData;
                serialData = undefined;
            }

            {
                tags = Array.from(entity.getTags());

                if (tags.length > 0) {
                    serialEntity[CTagMarker] = tags;
                }
            }

            outData.push(serialEntity);
        }

        return outData;
    }
}
