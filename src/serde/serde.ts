import {TObjectProto} from "../_.spec";
import {
    CTagMarker,
    ISerDe,
    ISerDeDataSet,
    ISerDeOperations,
    TCustomDeserializer,
    TDeserializer, TEntity,
    TSerDeOptions,
    TSerializer
} from "./serde.spec";
import {ISerialFormat} from "./serial-format.spec";
import {SerialFormat} from "./serial-format";
import IEntity, {TTag} from "../entity.spec";
import {getDefaultDeserializer, getDefaultSerializer} from "./default-handlers";
import {Entity} from "../entity";

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
        let entity: Entity;
        let serialComponentData: unknown;
        let serialComponentName: string;
        let serialEntity: TEntity;
        let tag: TTag;

        for (serialEntity of data) {
            entity = new Entity();

            for ([serialComponentName, serialComponentData] of Object.entries(serialEntity)) {
                if (finalOptions.useRegisteredHandlers && this.typeHandlers.has(serialComponentName)) {
                    entity.addComponent(this.typeHandlers.get(serialComponentName)!.deserializer(serialComponentData));
                } else if (serialComponentName == CTagMarker) {
                    if (!Array.isArray(serialComponentData)) {
                        throw new Error('Expected array of tags for the hash identifier!');
                    }

                    for (tag of serialComponentData) {
                        if (!['string', 'number'].includes(typeof tag)) {
                            throw new Error('Tags must be of type string or number!');
                        }

                        entity.addTag(tag);
                    }
                } else if (finalOptions.useDefaultHandler) {
                    entity.addComponent(getDefaultDeserializer(finalOptions.fallbackHandler)(serialComponentName, serialComponentData));
                }
            }

            entities.push(entity);
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
            serialEntity = {};

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
