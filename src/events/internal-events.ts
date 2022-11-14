import {ISystem} from "../system/system.spec";
import {TObjectProto} from "../_.spec";
import {IIStateProto} from "../state/state.spec";


class SimECSPDAEvent {
    constructor(
        public state: IIStateProto
    ) {}
}

export class SimECSPDAPushStateEvent extends SimECSPDAEvent {}


class SimECSResourceEvent<T extends TObjectProto> {
    constructor(
        public resourceType: T,
        public resourceObject: InstanceType<T>,
    ) {}
}

export class SimECSAddResourceEvent<T extends TObjectProto> extends SimECSResourceEvent<T> {}
export class SimECSReplaceResourceEvent<T extends TObjectProto> extends SimECSResourceEvent<T> {}


class SimECSSystemResourceEvent {
    constructor(
        public system: ISystem,
        public paramName: string,
        public resource: TObjectProto,
    ) {}
}

export class SimECSSystemAddResource extends SimECSSystemResourceEvent {}
export class SimECSSystemReplaceResource extends SimECSSystemResourceEvent {}
