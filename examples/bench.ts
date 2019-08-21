import {Component, ECS, IEntity, IWorld, System} from "../src";

const ecs = new ECS();
const world = ecs.createWorld();

// todo: add different libs and define a sane base (components, systems) which are the same for all of the libs.

let i;
const loops = 1000000;
const start = Date.now();
for (i = 0; i < loops; i++) world.dispatch();
console.log(`Time: ${Date.now() - start}ns for ${loops} dispatches.`);