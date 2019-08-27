import {ECS} from "../src";

const ecs = new ECS();
const world = ecs.createWorld();

// todo: add different libs and define a sane base (components, systems) which are the same for all of the libs.

let i;
const loops = 1000000;
const start = Date.now();

// todo: use world.run(), because it is less synthetic
(async () => { for (i = 0; i < loops; i++) await world.dispatch(); })()
    .catch(console.error)
    .then(() => console.log(`Time: ${Date.now() - start}ns for ${loops} dispatches.`));
