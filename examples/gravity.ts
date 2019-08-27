import {ECS} from "../src";
import {Gravity, Position, Velocity} from "./_helper";

// 1. Create a new ECS
const ecs = new ECS();

// 2. Create a world
const world = ecs.createWorld();

// 3. Define components (see _helper.ts for Position and Velocity)
// 4. Add entities with components
world.buildEntity()
    .with(Position)
    .with(Velocity)
    .build();

// 5. Define systems (see _helper.ts for Gravity)
// 6. Register the systems
world.registerSystem(new Gravity());

// 7. Dispatch the world to update the data contained in the components using the logic defined in the systems
const update = async function () {
    await world.dispatch();
    setTimeout(update, 500);
};

update().catch(console.error);
