import type {IEntity} from "../entity/entity.spec";

export class EntityAdded {
    constructor(
        public entity: Readonly<IEntity>
    ) {}
}

export class EntityRemoved {
    constructor(
        public entity: Readonly<IEntity>
    ) {}
}
