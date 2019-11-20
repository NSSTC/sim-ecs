import {IEntity, ISystemWorld, System} from "..";

export type THandlerFn = (entity: IEntity) => void
export class S1 extends System {
    handler: THandlerFn;

    constructor(handler: THandlerFn) {
        super();
        this.handler = handler;
    }

    async update(world: ISystemWorld, entities: IEntity[], deltaTime: number): Promise<void> {
        for(const entity of entities) this.handler(entity);
    }
}
