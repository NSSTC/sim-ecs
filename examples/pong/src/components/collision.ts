import { IEntity } from "sim-ecs";

export class Collision {
    collisionObjects: IEntity[] = [];
    occurred = false;
}
