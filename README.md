# sim-ecs
ECS, which is optimized for simulations

I highly advice you to take a look at the (working) examples in the `/examples` directory 
and test runners in `/tests`.
The gravity example is the most basic one and shows you how to get a world up and running quickly.


## Considerations

This ECS is inspired by SPECS and Legion (two rust ECS libraries), however optimized for JS.
It is built for easy usage (DX) and high iteration speed.
The trade-off is that insertion and deletion are slow,
however there are optimizations and opinionations in place to still make it fast.
I recommend doing insertions and deletions at defined points (for example loading screens)
and batching these operations.
For on-the-fly changes, there is a way to register a callback which does the work
in between system executions, so that all systems can work on the same dataset per iteration. 

Batching entity creation can be done by using `-Quick` methods (for example `world.buildEntity.withQuick()`),
which will not calculate component and system dependencies). In the end, call `world.maintain()`
in order to do the heavy lifting.

Even while dispatching the world, you can use `-Quick` methods, however the inserted objects
will only work after calling `world.maintain()`. This way, changes to a simulation can be prepared
on a running world and then rather quickly added once ready.


## Creating the ECS and a world

In an ECS, a world is like a container for entities.

```typescript
import {Component, ECS, IEntity, IWorld, System} from "sim-ecs";

const ecs = new ECS();
const world = ecs.createWorld();
```


## Setting resources

Resources are objects, which can hold certain data, like the start DateTime.

```typescript
// this call implicitely creates a new object of type Date. You can also pass an instance instead.
// you can pass arguments to the constructor by passing them as additional parameters here
world.addResource(Date);
console.log(world.getResource(Date).getDate());
```


## Defining components

Components are needed to define data on which the whole system can operate.

```typescript
class Position {
    x = 0;
    y = 0;
}

class Velocity {
    x = 0;
    y = 0;
}
```

## Defining systems

Systems are the logic, which operates on data sets (components).
They are logic building blocks which separate concerns and make the world move.

```typescript
class Gravity extends System {
    protected absTime = 0;

    constructor() {
        super();

        // a component query is the filter which defines the components used by this system
        this.setComponentQuery([
            [Position, WRITE],
            [Velocity, WRITE],
        ]);
    }

    // update() is called every time the world needs to be updated. Put your logic in there
    update(world: IWorld, entities: IEntity[], deltaTime: number): void {
        this.absTime += deltaTime;
        for (let entity of entities) {
            const pos = entity.getComponent(Position);
            const vel = entity.getComponent(Velocity);

            if (!pos || !vel) continue;

            vel.y -= Math.pow(0.00981, 2) * this.absTime;
            pos.y += vel.y;

            console.log(`Pos: ${pos.y.toFixed(5)}    Vel: ${vel.y.toFixed(5)}`);
        }
    }
};

// register the system
world.registerSystem(new Gravity());
```


## Adding entities

Entities are like glue. They define which components belong together and form one data.
Entities are automatically added to the world they are built in.

```typescript
world.buildEntity()
    .with(Position) // this call implicitely creates a new object of type Position. You can also pass an instance instead.
    .with(Velocity) // you can pass arguments to the constructor by passing them as additional parameters here
    .build();
```


## Working with states (optional)

States allow for splitting up a simulation into different logical parts.
In games, that's for example "Menu", "Play" and "Pause".
States can be switched using a push-down automaton.
States define which systems should run, so that a pause-state can run graphics updates, but not game-logic, for example.
If no state is passed to the dispatcher, all systems are run by default.

While the world is running (using `run()`), the state can be changed between every world dispatch
using the handler function. Single calls to `dispatch()` do not offer the benefits of a PDA.

```typescript
class InitState extends State { _systems = [initSystem] }
class RunState extends State { _systems = [gravitySystem] }
class PauseState extends State { _systems = [pauseSystem] }
const initState = new InitState();
const runState = new RunState();

world.dispatch(initState);
while (true) world.dispatch(runState);
``` 

## Update loop

The update loop (for example game loop) is what keeps simulations running.
In this loop, the world is dispatched on each step (then it waits for 500ms for slower output).

```typescript
const update = function () {
    world.dispatch();
    setTimeout(update, 500);
};

update();
```
