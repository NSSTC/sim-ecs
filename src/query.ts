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
    TAccessQueryParameter, TExistenceQueryParameter, IAccessQueryResult
} from "./query.spec";
import {Entity, IEntity, TTag} from "./entity";
import {TTypeProto} from "./_.spec";
import IWorld from "./world.spec";

export * from "./query.spec";

// todo: ReadEntity() should also work
export class Query<
    C extends Object,
    DESC extends IAccessQuery<TTypeProto<C>> | TExistenceQuery<TTypeProto<C>>,
    ACCESS_RESULT extends IAccessQueryResult<C>,
    ACCESS_DATA extends
        DESC extends IAccessQuery<TTypeProto<C>>
            ? { [P in keyof DESC]: Required<Omit<InstanceType<DESC[P]>, keyof IAccessDescriptor<C>>> }
            : never,
    EXISTENCE_DATA extends IEntity,
    DATA extends
        DESC extends TExistenceQuery<TTypeProto<C>>
            ? EXISTENCE_DATA
            : ACCESS_DATA
> {
    queryResult: Set<DATA> = new Set();

    constructor(
        protected recordDesc: DESC
    ) {}

    public get descriptor() {
        return this.recordDesc;
    }

    public [setEntitiesSym](entities: IterableIterator<IEntity>) {
        let entity;

        this.queryResult.clear();

        for (entity of entities) {
            if (this.matchesEntity(entity)) {
                if (Array.isArray(this.recordDesc)) {
                    // @ts-ignore if recordDesc is an array, it's a query for existence, which yields entities
                    this.queryResult.add(entity);
                } else {
                    const components: Record<string, C> = {};
                    let componentDesc: [string, TAccessQueryParameter<TTypeProto<C>>];

                    for (componentDesc of Object.entries(this.recordDesc)) {
                        if (componentDesc[1][accessDescSym].targetType == ETargetType.entity) {
                            // @ts-ignore in this case, entity is what we want!
                            components[componentDesc[0]] = entity;
                        } else {
                            components[componentDesc[0]] = entity.getComponent(componentDesc[1])!;
                        }
                    }

                    // @ts-ignore else it is a query for access, which yields the components
                    this.queryResult.add(components);
                }
            }
        }
    }

    public execute(handler: (data: DATA) => void): void {
        this.queryResult.forEach(handler);
    }

    public iter(world?: IWorld): IterableIterator<DATA> {
        if (world) {
            return world.getEntities(this);
        } else {
            return this.queryResult.values();
        }
    }

    public matchesEntity(entity: IEntity): boolean {
        if (Array.isArray(this.recordDesc)) {
            let componentDesc: TExistenceQueryParameter<TTypeProto<C>>;

            for (componentDesc of this.recordDesc) {
                if (
                    componentDesc[existenceDescSym].targetType == ETargetType.tag
                    && entity.hasTag(componentDesc[existenceDescSym].target as TTag) != (componentDesc[existenceDescSym].type == EExistence.set)
                ) {
                    return false;
                }

                if (
                    componentDesc[existenceDescSym].targetType == ETargetType.component
                    && entity.hasComponent(componentDesc[existenceDescSym].target as TTypeProto<C>) != (componentDesc[existenceDescSym].type == EExistence.set)
                ) {
                    return false;
                }
            }
        } else {
            let componentDesc: TAccessQueryParameter<TTypeProto<C>>;

            for (componentDesc of Object.values(this.recordDesc)) {
                if (
                    componentDesc[accessDescSym].targetType == ETargetType.tag
                    && !entity.hasTag(componentDesc[accessDescSym].target as TTag)
                ) {
                    return false;
                }

                if (
                    componentDesc[accessDescSym].targetType == ETargetType.component
                    && !entity.hasComponent(componentDesc[accessDescSym].target as TTypeProto<C>)
                ) {
                    return false;
                }
            }
        }

        return true;
    }
}

export function ReadEntity(): TAccessQueryParameter<TTypeProto<Readonly<Entity>>> {
    return Object.assign({}, Entity.prototype, {
        [accessDescSym]: {
            target: TTypeProto<Entity>,
            targetType: ETargetType.entity,
            type: EAccess.meta,
        },
    } as IAccessDescriptor<InstanceType<Entity>>);
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

export function Write<C extends TTypeProto<Object>>(componentPrototype: C): TAccessQueryParameter<C> {
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

export function WithTag(tag: TTag): IExistenceDescriptor<TTypeProto<Object>> {
    return {
        [existenceDescSym]: {
            target: tag,
            targetType: ETargetType.tag,
            type: EExistence.set,
        }
    };
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

export function WithoutTag(tag: TTag): IExistenceDescriptor<TTypeProto<Object>> {
    return {
        [existenceDescSym]: {
            target: tag,
            targetType: ETargetType.tag,
            type: EExistence.unset,
        }
    };
}
