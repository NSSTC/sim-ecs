import {Read, ReadEntity, System, SystemData, With, Write} from "sim-ecs";
import {Shape} from "../components/shape";
import {Collision} from "../components/collision";
import {Position} from "../components/position";

class Data extends SystemData {
    readonly collision = Write(Collision)
    readonly entity = ReadEntity()
    readonly position = Read(Position)
    readonly shape = Read(Shape)
}

export class CollisionSystem extends System<Data> {
    readonly SystemDataType = Data;

    run(dataSet: Set<Data>) {
        const rects = Array.from(dataSet).map(item => {
            // ideally, this should be two separate steps,
            // but JS would loop twice.
            // As an optimization, I will include this data change into the map() function
            item.collision.collisionObjects.clear();
            item.collision.occurred = false;

            return {
                collisionData: item.collision,
                entity: item.entity,
                height: item.shape.dimensions.height ?? item.shape.dimensions.width,
                width: item.shape.dimensions.width,
                x: item.position.x,
                y: item.position.y,
            };
        });

        // todo: use optimized collider?
        for (let i = 0; i < rects.length - 1; i++) {
            for (let j = 0; j < rects.length - 1; j++) {
                if (i == j) {
                    continue;
                }

                const rect1 = rects[i];
                const rect2 = rects[j];

                // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
                if (rect1.x < rect2.x + rect2.width &&
                    rect1.x + rect1.width > rect2.x &&
                    rect1.y < rect2.y + rect2.height &&
                    rect1.y + rect1.height > rect2.y)
                {
                    rect1.collisionData.occurred = true;
                    rect1.collisionData.collisionObjects.add(rect2.entity);

                    rect2.collisionData.occurred = true;
                    rect2.collisionData.collisionObjects.add(rect1.entity);
                }
            }
        }
    }
}
