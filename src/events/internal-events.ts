import type {ISystem} from "../system/system.spec.ts";
import type {TObjectProto} from "../_.spec.ts";
import type {IState} from "../state/state.spec.ts";
import type {IEntity, TTag} from "../entity/entity.spec.ts";


export class SimECSEvent {}

class SimECSComponentEvent extends SimECSEvent {
    constructor(
        public readonly componentType: Readonly<TObjectProto>,
        public readonly componentInstance: Readonly<object>,
    ) { super() }
}

export class SimECSAddComponentEvent extends SimECSComponentEvent {}
export class SimECSRemoveComponentEvent extends SimECSComponentEvent {}


class SimECSEntityEvent extends SimECSEvent {
    constructor(
        public readonly entity: Readonly<IEntity>,
    ) { super() }
}

export class SimECSAddEntityEvent extends SimECSEntityEvent {}
export class SimECSCloneEntityEvent extends SimECSEntityEvent {
    constructor(
        public readonly original: Readonly<IEntity>,
        public readonly clone: Readonly<IEntity>,
    ) {
        super(clone);
    }
}
export class SimECSMutateEntityEvent extends SimECSEntityEvent {}
export class SimECSEntityAddComponentEvent extends SimECSEntityEvent {
    constructor(
        public readonly entity: Readonly<IEntity>,
        public readonly componentType: Readonly<TObjectProto>,
        public readonly componentInstance: Readonly<object>,
    ) { super(entity) }
}
export class SimECSEntityAddTagEvent extends SimECSEntityEvent {
    constructor(
        public readonly entity: Readonly<IEntity>,
        public readonly tag: Readonly<TTag>,
    ) { super(entity) }
}
export class SimECSEntityCloneEvent extends SimECSEntityEvent {
    constructor(
        public readonly original: Readonly<IEntity>,
        public readonly clone: Readonly<IEntity>,
    ) { super(clone) }
}
export class SimECSEntityRemoveComponentEvent extends SimECSEntityEvent {
    constructor(
        public readonly entity: Readonly<IEntity>,
        public readonly componentType: Readonly<TObjectProto>,
        public readonly componentInstance: Readonly<object>,
    ) { super(entity) }
}
export class SimECSEntityRemoveTagEvent extends SimECSEntityEvent {
    constructor(
        public readonly entity: Readonly<IEntity>,
        public readonly tag: Readonly<TTag>,
    ) { super(entity) }
}
export class SimECSRemoveEntityEvent extends SimECSEntityEvent {}


class SimECSPDAEvent extends SimECSEvent {
    constructor(
        public readonly state: Readonly<IState> | undefined,
    ) { super() }
}

export class SimECSPDAPopStateEvent extends SimECSPDAEvent {
    constructor(
        public readonly oldState: Readonly<IState> | undefined,
        public readonly newState: Readonly<IState> | undefined,
    ) {
        super(newState);
    }
}

export class SimECSPDAPushStateEvent extends SimECSPDAEvent {
    constructor(
        public readonly oldState: Readonly<IState> | undefined,
        public readonly newState: Readonly<IState>,
    ) {
        super(newState);
    }
}


class SimECSResourceEvent<T extends TObjectProto> extends SimECSEvent {
    constructor(
        public resourceType: T,
        public resourceInstance: InstanceType<T>,
    ) { super() }
}

export class SimECSAddResourceEvent<T extends TObjectProto> extends SimECSResourceEvent<T> {}
export class SimECSReplaceResourceEvent<T extends TObjectProto> extends SimECSResourceEvent<T> {}
export class SimECSRemoveResourceEvent<T extends TObjectProto> extends SimECSResourceEvent<T> {}


class SimECSSystemResourceEvent extends SimECSEvent{
    constructor(
        public readonly system: Readonly<ISystem>,
        public readonly paramName: string,
        public readonly resource: Readonly<TObjectProto>,
    ) { super() }
}

export class SimECSSystemAddResourceEvent extends SimECSSystemResourceEvent {}
export class SimECSSystemReplaceResourceEvent extends SimECSSystemResourceEvent {}


class SimECSTagEvent extends SimECSEvent {
    constructor(
        public readonly tag: Readonly<TTag>,
    ) { super() }
}

export class SimECSAddTagEvent extends SimECSTagEvent {}
export class SimECSRemoveTagEvent extends SimECSTagEvent {}
