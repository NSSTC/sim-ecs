import { IEntity } from "../ecs";

export class Collision {
    collisionObjects: Set<IEntity> = new Set();
    occurred = false;
}
