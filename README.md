# sim-ecs

A type-based, components-first, fully async batteries-included ECS, which is optimized for simulation needs.
There's a big emphasis on developer experience, like type-hinting and auto-completions. 
Sim-ecs will run in NodeJS, Deno, BunJS and the browser.

It can be installed using your favorite package manager, for example:

```shell
$ npm install sim-ecs
```

or used as direct import for Deno:

```typescript
import * as simEcs from "https://deno.land/x/sim_ecs@v0.6.4/src/index.ts";
```


---


- [Considerations](#considerations)
- [Why use sim-ecs](#why-use-sim-ecs)
    - [Runtime requirements](#runtime-requirements)
- [Examples](#examples)
    - [Counter](#counter)
    - [Events](#events)
    - [Pong](#pong)
    - [System Error](#system-error)
- [Where is the Documentation](#where-is-the-documentation)
    - [Creating the ECS and a World](#creating-the-ecs-and-a-world)
        - [Prepare-Time World](#prepare-time-world)
        - [Runtime World](#runtime-world)
- [Setting Resources](#setting-resources)
    - [Defining Systems](#defining-systems)
      - [System Parameter Types](#system-parameter-types)
      - [Hot Reloading Systems](#hot-reloading-systems)
- [Defining Components](#defining-components)
- [Adding Entities](#adding-entities)
- [Working with States](#working-with-states--optional-)
- [Update loop](#Update-loop)
- [Commands](#commands)
- [Saving and using Prefabs](#saving-and-using-prefabs)
- [Syncing instances](#syncing-instances)
- [Building for Production](#building-for-production)
- [Plugins](#plugins)
- [Performance](#performance)
    - [The Benchmarks](#the-benchmarks)
    - [The Result](#the-result)


## Considerations

This ECS is inspired by SPECS and bevy-ecs (two Rust ECS libraries), however optimized for TypeScript.
It is built for easy usage (DX) and high iteration speed.
The trade-off is that insertion and deletion are slower,
however there are optimizations and opinionations in place to still make it fast.
For example, by using commands, these operations are batched and executed when it is safe to perform them.

In order to create optimized simulation runs, the ECS has to be fully specified in the beginning.
All components, systems and queries need to be registered at the start.


### AoS vs SoA

Sim-ecs uses the AoS (Array of Structs) approach, because it leads to much more control on the library side,
and better lends itself to the promises we make about sim-ecs. The result is a polished experience with simple usage.

An SoA (Struct of Arrays) on the other hand is an approach famously used by bitecs to get performance out of
low-level mechanics in JS. This means it has overall better raw performance, but puts a lot of responsibilities on the 
lib-users' side. This leads to more time spend developing ecs features, which already exist in sim-ecs.


## Why use sim-ecs

Sim-ecs was created out of the lack of a fast, featured ECS library for TypeScript, which is able to handle
the requirements in a big, agile game project. While there are other ECS libraries available,
they do not necessarily cater to that goal and will have short-comings in such an environment.

Sim-ecs comes with batteries included to make sure everything fits together and is simple to use.
The focus is on developer-friendliness (by supporting full type/intention support in the IDE),
support for a variety of scenarios and performance.

Since sim-ecs implements many bevy-ecs RFCs, it is very featured and modern. It can be used inside a generic game engine
or for a game directly.


### Runtime requirements

If using the prebuilt library, "ES2020" was selected as the build target. Hence, this is the matrix:

| App              | Version | Comment                     |
|------------------|---------|-----------------------------|
| Chrome           | 80+     | Desktop and mobile          |
| Edge             | 80+     |                             |
| Safari           | 14.1+   | Desktop and mobile          |
| Firefox          | 80+     | Desktop (no info on mobile) |
| Opera            | 67+     | Desktop                     |
| Samsung Internet | 13.0+   |                             |
| NodeJS           | 14+     |                             |
| Deno             | 1.0+    |                             |
| Bun              | 0.2.2+  |                             |


## Examples

For quickly seeing the ECS in action, there are several examples available.
You can find them in the `/examples` directory.


### Counter

```
$ npm run example-counter
``` 

The counter example is a very small, minimal example to get a quick overview.
It increases a number a few times and then terminates.


### Events

```
$ npm run example-events
``` 

The events example demonstrates how to use the event bus to write and read events.
It will print a message every second.


### Pong

![Pong can be played with the keyboard and saves on pausing.](./media/pong.png)

```
$ cd examples/pong && npm install && npm run start
``` 

Pong is a full game which can be run in the browser. It demonstrates all features of sim-ecs.
It comes with numerous components and systems, handles states and makes use of prefabs and saves.
Since it is an ECS demo, other parts of the game code may be minimal, like rendering and sound.
It is recommended to use readily available libraries for these parts for any real endeavour, like BabylonJS.

You will need to build Pong from its directory.
Then, you can open the `index.html` in the public folder to run the game.


### System Error

![On error, detailed information including the system's name can be retrieved](./media/error.png)

```
$ npm run example-system-error
``` 

Error handling is very simple with sim-ecs. It uses the events system to catch and provide handling opportunities
without aborting the execution.
The System-Error example demonstrates how error handling works with a simple example.


## Where is the Documentation

Anything which is not explained in detail enough in this README can be found in the code.
You will notice that there are spec-files. These contain the specification for a certain class,
which usually means an interface with comments on what the methods do.

Also, there is a [generated API-documentation](https://nsstc.github.io/sim-ecs/) available!


## Creating the ECS and a World

In an ECS, a world is like a container for entities.
Sim-ecs comes, by default, with two variants: A prepare-time world and a runtime world.

_See
["Counter" example](https://github.com/NSSTC/sim-ecs/blob/master/examples/counter.ts)
&nbsp;_


### Prepare-Time World

The prepare-time world is a place which focuses on easily preparing a simulation.
That means, this is the place where everything should be defined and readied.

```typescript
const prepWorld = buildWorld().build();
```

_See
[IPreptimeWorld](https://nsstc.github.io/sim-ecs/interfaces/IPreptimeWorld.html),
["Counter" example](https://github.com/NSSTC/sim-ecs/blob/master/examples/counter.ts)
&nbsp;_


### Runtime world

After the preparation is done, a runtime world can be forked, which is optimized for executing a simulation.
One of the main differences is that this world is not as configurable,
in order to optimize for what was set up in the prep-time world.

```typescript
const runWorld = await prepWorld.prepareRun();
```

_See
[IRuntimeWorld](https://nsstc.github.io/sim-ecs/interfaces/IRuntimeWorld.html),
["Counter" example](https://github.com/NSSTC/sim-ecs/blob/master/examples/counter.ts)
&nbsp;_


## Scheduling a run

In sim-ecs, a run has to be planned ahead. This is done by giving a developer the means to put systems into stages
and then decide in which order stages should run and if they run in parallel.

One thing to add is that a pipeline, which contains the entire program order, is made up of "Sync Points". These
constructs allow for hooking into the plan in a non-destructive way. For example third-party code (like plugins)
can make use of such a feature to add their own Systems at the right place in the program chronology.
If that's not necessary, sim-ecs will work fine with just the `root` Sync Point.

```typescript
const prepWorld = buildWorld()
    .withDefaultScheduling(root => root
        .addNewStage(stage => stage
            .addSystem(CounterSystem)
        )
    )
    .build();
```

Since this is a very verbose way, sim-ecs also adds a data-driven approach,
which enables schedules to be stored as simple arrays which can even be loaded without logic.
The Pong example demonstrates this by providing several schedules, stored as separate data. In short:

```typescript
import {buildWorld, ISyncPointPrefab} from "sim-ecs";

const gameSchedule: ISyncPointPrefab = {
    stages: [
        // Stages are executed sequentially (order guaranteed!)
        [BeforeStepSystem],
        [InputSystem],
        [
            // Systems inside a stage are executed in parallel, if possible (no order guaranteed!)
            MenuSystem,
            PaddleSystem,
            PauseSystem,
        ],
        [CollisionSystem],
        [BallSystem],
        [AnimationSystem],
        [
            RenderGameSystem,
            RenderUISystem,
        ],
        [ErrorSystem],
    ],
};

const prepWorld = buildWorld()
    .withDefaultScheduling(root => root.fromPrefab(gameSchedule))
    .build();
```

_See
["Counter" example](https://github.com/NSSTC/sim-ecs/blob/master/examples/counter.ts),
["Pong" example](https://github.com/NSSTC/sim-ecs/tree/master/examples/pong)
&nbsp;_


## Setting Resources

Resources are objects, which can hold certain data, like the start DateTime.

```typescript
// this call implicitely creates a new object of type Date. You can also pass an instance instead.
// you can pass arguments to the constructor by passing them as additional parameters here
prepWorld.addResource(Date);
console.log(world.getResource(Date).getDate());
```

_See
[addResource()](https://nsstc.github.io/sim-ecs/interfaces/IMutableWorld.html#addResource),
[getResource()](https://nsstc.github.io/sim-ecs/interfaces/IWorld.html#getResource),
[getResources()](https://nsstc.github.io/sim-ecs/interfaces/IWorld.html#getResources)
&nbsp;_

## Defining Systems

Systems are the logic, which operates on data sets (components).
They are logic building blocks which separate concerns and make the world move.

```typescript
const CountSystem = createSystem({
    query: queryComponents({counterObj: Write(Counter)}),
})
    // this function is called every time the world needs to be updated. Put your logic in there
    .withRunFunction(({query}) =>
        query.execute(({counterObj}) => console.log(++counterObj.a))
    )
    .build();
```

_See
[createSystem()](https://nsstc.github.io/sim-ecs/functions/createSystem.html),
[ISystemBuilder](https://nsstc.github.io/sim-ecs/classes/SystemBuilder.html),
["Counter" example](https://github.com/NSSTC/sim-ecs/blob/master/examples/counter.ts),
["Pong" example](https://github.com/NSSTC/sim-ecs/tree/master/examples/pong)
&nbsp;_


### System Parameter Types

A system can request different types of parameter:


```typescript
const CountSystem = createSystem({
    // Queries are most obvious, since they allow access to stored data
    // All parameters form the query, and only entities which match all criteria will be picked
    query: queryComponents({
        // Access the entity matching this query
        entity: ReadEntity(),
        // Access to a component
        counterObjR: Read(Counter),
        // This component may or may not exist, but if it does, it's readonly
        counterObjRO: ReadOptional(Counter),
        // Access a component in a mutable way
        counterObjW: Write(Counter),
        // This component may or may not exist, but if it does, it's mutable
        counterObjWO: WriteOptional(Counter),
        // If the component itself doesn't matter, but it must exist on the entity, this is the way!
        _counterObjWith: With(Counter),
        // It's also possible to require tags to be present. There's no value.
        _tag1: WithTag(ATag),
        // If the component itself doesn't matter, but it must _not_ exist on the entity, this is the way!
        _counterObjWithout: WithOut(Counter),
        // It's also possible to require that the entity does _not_ have a tag
        _tag2: WithoutTag(ATag),
    }),
    // As a way to pass information between systems and event the outside,
    // sim-ecs provides an event bus. It can be accessed easily from systems:
    eventReader: ReadEvents(MyEvent),
    eventWriter: WriteEvents(MyEvent),
    // If it's necessary to mutate the runnning world, "system actions" can be accessed!
    actions: Actions,
    // World-global resources can also be easily be added. Their access is cached, which is a performance boost
    resourceR: ReadResource(Date),
    resourceW: WriteResource(Date),
    // Last but not least, systems also allow for local variables,
    // which are unique to that system instance within a run.
    // Please prefer them over putting variables into the module's scope!
    // They can be declared using a generic (if needed) and initialized in the parameter 
    systemStorage1: Storage({ foo: 42, bar: 'Hello!' }),
    systemStorage2: Storage({ data: [1,2,3] }),
}).build();
```

_See
[createSystem()](https://nsstc.github.io/sim-ecs/functions/createSystem.html)
&nbsp;_


### Hot Reloading Systems

Systems can be hot-reloaded. The Pong example shows that off nicely.
In order to enable HMR, the following is suggested:

1. Make sure that you put every system into its own module (file), from which it's exported.
2. Every system must be named.
3. Implement your dev server's HMR strategy and on accept call `hmrSwapSystem()`. 
   It takes the new system as its parameter, which you should get from the new module's exports.

For example, a system module may look like this:

```typescript
import {createSystem, hmrSwapSystem, ISystem, queryComponents, Read, ReadResource, Write} from "sim-ecs";
import {Position} from "../components/position.ts";
import {Velocity} from "../components/velocity.ts";
import {GameStore} from "../models/game-store.ts";


// The System must be exported (of course)
export const AnimationSystem = createSystem({
    gameStore: ReadResource(GameStore),
    query: queryComponents({
        pos: Write(Position),
        vel: Read(Velocity),
    }),
})
    .withName('AnimationSystem')                                                  // It's important to name the System!!
    .withRunFunction(({gameStore, query}) => {
        const k = gameStore.lastFrameDeltaTime / 10;
        return query.execute(({pos, vel}) => {
            pos.x += vel.x * k;
            pos.y += vel.y * k;
        });
    })
    .build();

// using the dev server's HMR strategy...
// @ts-ignore
hmr:if (import.meta.hot) {
    // @ts-ignore
    import.meta.hot.accept(mod => 
        hmrSwapSystem(mod[Object.getOwnPropertyNames(mod)[0]] as AnimationSystem) // pass the System from the new Module
    );
}
```

Note: The label `hmr` was chosen as an easy and reliable way to remove this code block from a prod build.

_See
["Pong" example](https://github.com/NSSTC/sim-ecs/blob/master/examples/pong/src/systems/ball.ts)
&nbsp;_


## Defining Components

Components are needed to define data on which the whole system can operate.
You can think of them like columns in a database.
Any serialize-able object may be a component in sim-ecs.

```typescript
class Counter {
    a = 0;
}

const prepWorld = createWorld().withComponent(Counter).build();
prepWorld.buildEntity().with(Counter).build();
```

In case you have advanced components, it is possible to pass a serializer and deserializer
to the entity builder later on. If you don't do so, it is assumed that the component is a simple data struct.
You can also use a default-type de-/serializer on save/load, which allows for a variety of standard types (such as `Date`) as components.

_See
[IWorldBuilder](https://nsstc.github.io/sim-ecs/interfaces/IWorldBuilder.html),
[buildEntity()](https://nsstc.github.io/sim-ecs/interfaces/IPreptimeWorld.html#buildEntity),
[IEntityBuilder](https://nsstc.github.io/sim-ecs/interfaces/IEntityBuilder.html)
&nbsp;_


## Adding Entities

Entities are like glue. They define which components belong together and form one data.
Entities are automatically added to the world they are built in.
You can think of entities like rows in a database.

```typescript
prepWorld.buildEntity().withComponent(Counter).build();
```

_See
[buildEntity()](https://nsstc.github.io/sim-ecs/interfaces/IPreptimeWorld.html#buildEntity),
[IEntityBuilder](https://nsstc.github.io/sim-ecs/interfaces/IEntityBuilder.html)
&nbsp;_


## Working with States (optional)

States allow for splitting up a simulation into different logical parts.
In games, that's for example "Menu", "Play" and "Pause".
States can be switched using a push-down automaton.
States define which systems should run, so that a pause-state can run graphics updates, but not game-logic, for example.
If no state is passed to the dispatcher, all systems are run by default.

While the world is running (using `run()`), the state can be changed using commands.
Single calls to `step()` do not offer the benefits of a PDA.

_See
["Pong" example](https://github.com/NSSTC/sim-ecs/tree/master/examples/pong/src/states)
&nbsp;_


## Update loop

The update loop (for example game loop) is what keeps simulations running.
In order to provide an efficient way of driving the ECS, sim-ecs offers its own built-in loop:

```typescript
runWorld.start() // run() will drive the simulation based on the data provided to set up the world
    .catch(console.error) // this won't catch non-fatal errors, see error example!
    .then(() => console.log('Finished.'));
```

While this is the recommended way to drive a simulation, sim-ecs also offers a step-wise execution: `runWorld.step()`.
Note, though, that each step will need to run the preparation logic, which introduces overhead!


## Commands

Commands, accessible using `runWorld.commands` and `actions.commands` in Systems, are a mechanism,
which queues certain functionality, like adding entities.
The queue is then worked on at certain sync points, usually at the end of every step.
This is a safety and comfort mechanism, which guarantees that critical changes can be triggered comfortably,
but still only run at times when it is actually safe to do them.

Such sync points include any major transitions in a step's life-cycle, and sim-ecs will always trigger the execution
of all queued commands at the end of the step.

_See
[ICommands](https://nsstc.github.io/sim-ecs/interfaces/ICommands.html)
&nbsp;_


## Saving and using Prefabs

Prefabs, short for pre-fabrications, are ready-made files or objects,
which can be loaded at runtime to initialize a certain part of the application.
In the case of sim-ecs, prefabs can be used to load entities with their components.

All loaded entities are tracked and can be unloaded when not needed anymore. This is thanks to a grouping mechanism,
which means that prefabs can be used to design menus, levels, GUIs, etc. which are only loaded when needed
and discarded after use. After all, who needs level1 data when they switched over to level2?

The same is true for save games, so that when going back to the menu or loading another save, this can be done cleanly.

Saving and loading save-data works the same in sim-ecs, since they both use a shared mechanism
If you wish to work with the raw serializable data instead of writing it as JSON, the SaveFormat extends Array,
so it can be used just like an `Array<TEntity>`.

```typescript
enum MonsterTypes {
    Duck,
    Lizard,
    Tiger,
}

// loading a prefab, the prefab might be in a different file, even maybe just JSON data!
const prefab = [
    {
        Position: {
            x: 0,
            y: 1,
        } satisfies Position,
        Player: {
            level: 1,
            name: 'Jane',
        } satisfies Player,
        Health: {
            current: 100,
            max: 100,
        } satisfies Health,
    },
    {
        Position: {
            x: 0,
            y: 1,
        } satisfies Position,
        Monster: {
            hostileToPlayer: true,
            type: MonsterTypes.Tiger,
        } satisfies Monster,
        Health: {
            current: 100,
            max: 250,
        } satisfies Health,
    },
];


// to load from JSON, use SerialFormat.fromJSON() instead!
const prefabHandle = prepWorld.load(SerialFormat.fromArray(prefab));

// ...

// unloading is also easily possible to clean up the world
runWorld.unloadPrefab(prefabHandle);
```

```typescript
// saving a prefab from the current world. This may be used to write an editor
// or export a PoC for game designers to improve on
const jsonPrefab = runWorld.save().toJSON(4);
saveToFile(jsonPrefab, 'prefab.json');
```

```typescript
// filtering what should be saved is also possible,
// so that only certain data is saved and not all data of the whole world
const saveData = runWorld.save(queryEntities(With(Player))).toJSON();
localStorage.setItem('save', saveData);
```

_See
[load()](https://nsstc.github.io/sim-ecs/interfaces/IWorld.html#load),
[save()](https://nsstc.github.io/sim-ecs/interfaces/ITransitionActions.html#save),
["Pong" example](https://github.com/NSSTC/sim-ecs/blob/master/examples/pong/src/states/game.ts)
&nbsp;_


## Syncing instances

In order to keep several instances in sync, sim-ecs provides tooling.
Especially when writing networked simulations, it is very important to keep certain entities in sync.

```typescript
// OPTIONALLY initialize UUID mechanism
import {uuid} from 'your-favorit-uuid-library';
Entity.uuidFn = uuid; // type: () => string

// at the source, entities can be created as normal
const entity = prepWorld.buildEntity().build();

// IDs are created lazily when getting them for the first time
const entityId = entity.id;

// on another instance, you can assign the entity ID on entity creation:
const syncedEntity = prepWorld.buildEntity(entityId).build();

// in order to fetch an entity with a given ID, the ECS's function can be used
const entityFromIdGetter = getEntity(entityId);
// or inside a Query:
const {entityFromIdQuery} = queryComponents({ entityFromIdQuery: ReadEntity(entityId) }).getFirst();
```


## Building for Production

When building for production, it is important to keep class names. Some minimizers need to be adjusted.
The Pong example is a good template for a project setup for development and production builds. 


### Webpack

Webpack must [use Terser](https://webpack.js.org/plugins/terser-webpack-plugin/). The config could look like this:

```javascript
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        keep_classnames: true,
      },
    })],
  },
};
```


## Plugins

Here's an overview of known plugins for sim-ecs:

| Name                                                    | Description        |
|---------------------------------------------------------|--------------------|


## Performance

Please take the results with a grain of salt. These are benchmarks, so they are synthetic.
An actual application will use a mix out of everything and more, and depending on that may have a different experience.

You can run these benchmarks on your own machine - they are in the `examples/bench` folder.

The below result compares several AoS-based ECS libraries, which are similar to sim-ecs.
The only exception is bitecs, which is a SoA-based ECS library, for its usage in Phaser.


### The Benchmarks

These benchmarks are based on the Rust [ECS Bench Suite](https://github.com/rust-gamedev/ecs_bench_suite).


#### Simple Insert

This benchmark is designed to test the base cost of constructing entities and moving components into the ECS.
Inserts 1,000 entities, each with 4 components.


#### Simple Iter

This benchmark is designed to test the core overheads involved in component iteration in best-case conditions.

Dataset: 1,000 entities, each with 4 components.

Test: Iterate through all entities with Position and Velocity, and add velocity onto position.


#### System Scheduling

This benchmark is designed to test how efficiently the ECS can schedule multiple independent systems.
This is primarily an outer-parallelism test.

Dataset:

- 10,000 entities with (A, B) components.
- 10,000 entities with (A, B, C) components.
- 10,000 entities with (A, B, C, D) components.
- 10,000 entities with (A, B, C, E) components.

Test: Three systems accessing the following components mutably, where each system swaps the values stored in each component:

- (A, B)
- (C, D)
- (C, E)


#### Serialize

This benchmark is designed to test how quickly the ECS can serialize and deserialize its entities in JSON.

Dataset: 1,000 entities, each with 4 components.

Test: Serialize all entities to JSON in-memory. Then deserialize back into the ECS.


### The Result

```
--------------------------------------------------------------------------------
TypeScript ECS Bench
--------------------------------------------------------------------------------

22nd May 2024

Platform: Windows_NT win32 x64 v10.0.22631
CPU: AMD Ryzen 7 3700X 8-Core Processor@3600MHz
NodeJS: v21.1.0

Bench           v0.3.0
TypeScript      v5.4.5
TS-Lib          v2.6.2
TSX             v4.10.5

Ape-ECS         v1.3.1
bitecs          v0.3.40
Javelin         v1.0.0-alpha.13
sim-ecs         v0.6.5
tick-knock      v4.2.0

Measured in "points" for comparison. More is better!
```


 **Default Suite / Simple Insert**

|    Library | Points | Deviation | Comment |
|-----------:|-------:|:----------|:--------|
|    Ape-ECS |    767 | ± 1.1%    |         |
|     bitecs |  11218 | ± 0.41%   |         |
|    javelin |   2028 | ± 1.6%    |         |
|    sim-ecs |   1057 | ± 1.1%    |         |
| tick-knock |   7911 | ± 0.22%   |         |



 **Default Suite / Simple Iter**

|    Library | Points | Deviation | Comment |
|-----------:|-------:|:----------|:--------|
|    Ape-ECS |  23170 | ± 0.21%   |         |
|     bitecs | 119904 | ± 0.36%   |         |
|    javelin |  19845 | ± 0.049%  |         |
|    sim-ecs |    924 | ± 0.23%   |         |
| tick-knock |  11038 | ± 0.085%  |         |




 **Default Suite / Schedule**

|    Library | Points | Deviation | Comment |
|-----------:|-------:|:----------|:--------|
|    Ape-ECS |    110 | ± 0.13%   |         |
|     bitecs |   7288 | ± 0.19%   |         |
|    javelin |    101 | ± 0.071%  |         |
|    sim-ecs |    244 | ± 0.29%   |         |
| tick-knock |     55 | ± 0.18%   |         |



 **Default Suite / Serialize**

| Library | Points | Deviation | Comment                      |
|--------:|-------:|:----------|:-----------------------------|
| Ape-ECS |     64 | ± 1.4%    | file size: 417.3427734375 KB |
| Javelin |    557 | ± 1.3%    | file size: 31.1455078125 KB  |
| sim-ecs |    113 | ± 1.6%    | file size: 92.677734375 KB   |


