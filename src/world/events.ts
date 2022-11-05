import type {IEntity} from "../entity/entity.spec";

export class EntityAdded {
    constructor(
        public entity: IEntity
    ) {}
}

export class EntityRemoved {
    constructor(
        public entity: IEntity
    ) {}
}
