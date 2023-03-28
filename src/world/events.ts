import type {IEntity} from "../entity/entity.spec.ts";

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
