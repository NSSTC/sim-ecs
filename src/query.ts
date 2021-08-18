import {
    accessDescSym,
    EAccess,
    ETargetType,
    IAccessDescriptor,
    IExistenceDescriptor,
    existenceDescSym,
    EExistence,
    IAccessQuery,
    setEntitiesSym,
    TExistenceQuery,
    TAccessQueryParameter, TExistenceQueryParameter, addEntitySym, removeEntitySym, clearEntitiesSym
} from "./query.spec";
import {Entity, IEntity, TTag} from "./entity";
import {TObjectProto, TTypeProto} from "./_.spec";
import IWorld from "./world.spec";

export * from "./query.spec";


export type TAccessQueryData<DESC extends IAccessQuery<TObjectProto>> = {
    [P in keyof DESC]: Required<Omit<InstanceType<DESC[P]>, keyof IAccessDescriptor<Object>>>
}

export class Query<
    DESC extends IAccessQuery<TObjectProto> | TExistenceQuery<TObjectProto>,
    DATA =
        DESC extends TExistenceQuery<TObjectProto>
            ? IEntity
            : DESC extends IAccessQuery<TObjectProto>
                ? TAccessQueryData<DESC>
                : never
> {
    protected queryResult: Map<IEntity, DATA> = new Map();

    constructor(
        protected queryDescriptor: DESC
    ) {}

    public get descriptor() {
        return this.queryDescriptor;
    }

    public [addEntitySym](entity: IEntity) {
        if (this.matchesEntity(entity)) {
            if (Array.isArray(this.queryDescriptor)) {
                this.queryResult.set(entity, entity as unknown as DATA);
            } else {
                this.queryResult.set(entity, this.getDataFromEntity(entity, this.queryDescriptor));
            }
        }
    }

    public [clearEntitiesSym]() {
        this.queryResult.clear();
    }

    public [removeEntitySym](entity: IEntity) {
        this.queryResult.delete(entity)
    }

    public [setEntitiesSym](entities: IterableIterator<IEntity>) {
        let entity;

        this.queryResult.clear();

        for (entity of entities) {
            this[addEntitySym](entity);
        }
    }

    public execute(handler: (data: DATA) => void): void {
        let data: DATA;
        for (data of this.queryResult.values()) {
            handler(data);
        }
    }

    protected getDataFromEntity<K extends keyof DESC>(entity: IEntity, descriptor: DESC): DATA {
        const components: Record<string, K | IEntity> = {};
        let componentDesc: [string, TAccessQueryParameter<TTypeProto<K>>];

        for (componentDesc of Object.entries(descriptor)) {
            if (componentDesc[1][accessDescSym].type == EAccess.meta) {
                if (componentDesc[1][accessDescSym].targetType == ETargetType.entity) {
                    components[componentDesc[0]] = entity;
                }
            } else {
                components[componentDesc[0]] = entity.getComponent(componentDesc[1][accessDescSym].target as TTypeProto<K>)!;
            }
        }

        return components as unknown as DATA;
    }

    public getOne(): DATA | undefined {
        return this.queryResult.values().next().value;
    }

    public iter(world?: IWorld): IterableIterator<DATA> {
        if (world) {
            const data: DATA[] = [];
            // @ts-ignore todo: figure out why the type system errors `this`
            const entities = world.getEntities(this);
            let entity;

            for (entity of entities) {
                data.push(this.getDataFromEntity(entity, this.queryDescriptor));
            }

            return data.values();
        } else {
            return this.queryResult.values();
        }
    }

    public matchesEntity(entity: IEntity): boolean {
        if (Array.isArray(this.queryDescriptor)) {
            let componentDesc: TExistenceQueryParameter<TObjectProto>;

            for (componentDesc of this.queryDescriptor) {
                if (
                    componentDesc[existenceDescSym].targetType == ETargetType.tag
                    && entity.hasTag(componentDesc[existenceDescSym].target as TTag) != (componentDesc[existenceDescSym].type == EExistence.set)
                ) {
                    return false;
                }

                if (
                    componentDesc[existenceDescSym].targetType == ETargetType.component
                    && entity.hasComponent(componentDesc[existenceDescSym].target as TObjectProto) != (componentDesc[existenceDescSym].type == EExistence.set)
                ) {
                    return false;
                }
            }
        } else {
            let componentDesc: TAccessQueryParameter<TObjectProto>;

            for (componentDesc of Object.values(this.queryDescriptor)) {
                if (
                    componentDesc[accessDescSym].targetType == ETargetType.tag
                    && !entity.hasTag(componentDesc[accessDescSym].target as TTag)
                ) {
                    return false;
                }

                if (
                    componentDesc[accessDescSym].targetType == ETargetType.component
                    && !entity.hasComponent(componentDesc[accessDescSym].target as TObjectProto)
                ) {
                    return false;
                }

                if (
                    componentDesc[accessDescSym].targetType == ETargetType.entity
                    && componentDesc[accessDescSym].data !== undefined
                    && componentDesc[accessDescSym].data != entity.id
                ) {
                    return false;
                }
            }
        }

        return true;
    }
}

// todo: this is dangerous! The exposed interface should be reduced to prevent direct modifications in systems
export function ReadEntity(uuid?: string): TAccessQueryParameter<TTypeProto<Readonly<IEntity>>> {
    return Object.assign({}, Entity, {
        [accessDescSym]: {
            data: uuid,
            target: Entity,
            targetType: ETargetType.entity,
            type: EAccess.meta,
        },
    } as IAccessDescriptor<Entity>);
}

export function Read<C extends Object>(componentPrototype: TTypeProto<C>): TAccessQueryParameter<TTypeProto<Readonly<C>>> {
    return Object.assign({}, componentPrototype.prototype, {
        [accessDescSym]: {
            target: componentPrototype,
            targetType: ETargetType.component,
            type: EAccess.read,
        },
    } as IAccessDescriptor<C>);
}

export function Write<C extends Object>(componentPrototype: TTypeProto<C>): TAccessQueryParameter<TTypeProto<C>> {
    return Object.assign({}, componentPrototype.prototype, {
        [accessDescSym]: {
            target: componentPrototype,
            targetType: ETargetType.component,
            type: EAccess.write,
        },
    });
}

export function With<C extends Object>(componentPrototype: TTypeProto<C>): IExistenceDescriptor<TTypeProto<C>> {
    return {
        [existenceDescSym]: {
            target: componentPrototype,
            targetType: ETargetType.component,
            type: EExistence.set,
        }
    };
}

export function WithTag(tag: TTag): TAccessQueryParameter<TObjectProto> & IExistenceDescriptor<TObjectProto> {
    return {
        [accessDescSym]: {
            target: tag,
            targetType: ETargetType.tag,
            type: EAccess.meta,
        },
        [existenceDescSym]: {
            target: tag,
            targetType: ETargetType.tag,
            type: EExistence.set,
        }
    } as TAccessQueryParameter<TObjectProto> & IExistenceDescriptor<TObjectProto>;
}

export function Without<C extends Object>(componentPrototype: TTypeProto<C>): IExistenceDescriptor<TTypeProto<C>> {
    return {
        [existenceDescSym]: {
            target: componentPrototype,
            targetType: ETargetType.component,
            type: EExistence.unset,
        }
    };
}

export function WithoutTag(tag: TTag): IExistenceDescriptor<TObjectProto> {
    return {
        [existenceDescSym]: {
            target: tag,
            targetType: ETargetType.tag,
            type: EExistence.unset,
        }
    };
}
