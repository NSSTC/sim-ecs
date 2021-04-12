import { IEntity } from "sim-ecs";

export class Collision {
    collisionObjects: Set<IEntity> = new Set();
    occurred = false;
}
