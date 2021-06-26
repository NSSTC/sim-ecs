import {ISystemActions, Query, Read, ReadEntity, System, Write} from "sim-ecs";
import {Shape} from "../components/shape";
import {Collision} from "../components/collision";
import {Position} from "../components/position";

export class CollisionSystem extends System {
    query = new Query({
        collision: Write(Collision),
        entity: ReadEntity(),
        position: Read(Position),
        shape: Read(Shape)
    });

    run(actions: ISystemActions) {
        const rects = Array.from(this.query.iter()).map(({collision, entity, position, shape}) => {
            // ideally, this should be two separate steps,
            // but JS would loop twice.
            // As an optimization, I will include this data change into the map() function
            collision.collisionObjects.length = 0;
            collision.occurred = false;

            return {
                collisionData: collision,
                entity,
                height: shape.dimensions.height ?? shape.dimensions.width,
                width: shape.dimensions.width,
                x: position.x,
                y: position.y,
            };
        });

        // check for collision between all collision-enabled shapes
        // in this simple game, we only have 7 collision objects, so we don't need anything fancy!
        for (let i = 0; i < rects.length; i++) {
            for (let j = 0; j < rects.length; j++) {
                if (i == j) {
                    continue;
                }

                const rect1 = rects[i];
                const rect2 = rects[j];

                // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
                if (
                    rect1.x < rect2.x + rect2.width &&
                    rect1.x + rect1.width > rect2.x &&
                    rect1.y < rect2.y + rect2.height &&
                    rect1.y + rect1.height > rect2.y
                ) {
                    rect1.collisionData.occurred = true;
                    rect1.collisionData.collisionObjects.push(rect2.entity);

                    rect2.collisionData.occurred = true;
                    rect2.collisionData.collisionObjects.push(rect1.entity);
                }
            }
        }
    }
}
