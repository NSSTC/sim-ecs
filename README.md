# sim-ecs
Type-based, Components-first ECS, which is optimized for simulation needs. Will run in NodeJS and the browser.

```
npm install sim-ecs
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
- [Setting Resources](#setting-resources)
- [Defining Systems](#defining-systems)
- [Defining Components](#defining-components)
- [Adding Entities](#adding-entities)
- [Working with States](#working-with-states-optional)
- [Update loop](#Update-loop)
- [Commands](#commands)
- [Saving and using Prefabs](#saving-and-using-prefabs)
- [Syncing instances](#syncing-instances)
- [Building for Production](#building-for-production)
- [Comparison with other TS ECS libs](#comparison-with-other-ts-ecs-libs)
    - [Features](#features)
    - [Performance](#performance)


## Considerations

This ECS is inspired by SPECS, Legion and bevy-ecs (three Rust ECS libraries), however optimized for TypeScript.
It is built for easy usage (DX) and high iteration speed.
The trade-off is that insertion and deletion are slower,
however there are optimizations and opinionations in place to still make it fast.
For example, by using commands, these operations are batched and executed when it is safe to perform them.

In order to create optimized simulation runs, the ECS has to be fully specified in the beginning.
All components, systems and queries need to be registered at the start.


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

If using the prebuilt library, "ES2020" was used as a target. Hence, this is the matrix:

| App              | Version | Comment                        |
|------------------|---------|--------------------------------|
| Chrome           | 80+     | Desktop and mobile             |
| Edge             | 80+     |                                |
| Safari           | 14.1+   | Desktop and mobile             |
| Firefox          | 80+     | Desktop (no exact mobile data) |
| Opera            | 67+     | Desktop                        |
| Samsung Internet | 13.0+   |                                |
| NodeJS           | 14+     |                                |
| Deno             | -       | ESM + TS is a blocker          |
| Bun              | -       | Not tested, yet                |


## Examples

For quickly seeing the ECS in action, there are several examples available.
You can find them in the `/examples` directory.


### Counter

The counter example is a very small, minimal example to get a quick overview.
It increases a number a few times and then terminates. You can run it using:

```
$ npm run example-counter
``` 


### Events

The events example demonstrates how to use the event bus to write and read events.
It will print a message every second and can be executed with:

```
$ npm run example-events
``` 


### Pong

Pong is a full game which can be run in the browser. It demonstrates all features of sim-ecs.
It comes with numerous components and systems, handles states and makes use of prefabs and saves.
Since it is an ECS demo, other parts of the game code may be minimal, like rendering and sound.
It is recommended to use readily available libraries for these parts for any real endeavour, like BabylonJS.

You will need to build Pong from its directory.
Then, you can open the `index.html` in the public folder to run the game.


### System Error

Error handling is very simple with sim-ecs. It uses the events system to catch and provide handling opportunities
without aborting the execution.
The System-Error example demonstrates how error handling works with a simple example.

```
$ npm run example-system-error
``` 


## Where is the Documentation

Anything which is not explained in detail enough in this README can be found in the code.
You will notice that there are spec-files. These contain the specification for a certain class,
which usually means an interface with comments on what the methods do.

Also, there is a [generated API-documentation](https://nsstc.github.io/sim-ecs/) available!


## Creating the ECS and a World

In an ECS, a world is like a container for entities.

```typescript
const world = buildWorld().build();
```

## Scheduling a run

In sim-ecs, a run has to be planned ahead. This is done by giving a developer the means to put systems into stages
and then decide in which order stages should run and if they run in parallel.

One thing to add is that a pipeline, which contains the entire program order, is made up of "Sync Points". These
constructs allow for hooking into the plan in a non-destructive way. For example third-party code (like plugins)
can make use of such a feature to add their own Systems at the right place in the program chronology.
If that's not necessary, sim-ecs will work fine with just the `root` Sync Point.

```typescript
const world = buildWorld()
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
        // Stage is executed sequentially (order guaranteed!)
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

const world = buildWorld()
    .withDefaultScheduling(root => root.fromPrefab(gameSchedule))
    .build();
```


## Setting Resources

Resources are objects, which can hold certain data, like the start DateTime.

```typescript
// this call implicitely creates a new object of type Date. You can also pass an instance instead.
// you can pass arguments to the constructor by passing them as additional parameters here
world.addResource(Date);
console.log(world.getResource(Date).getDate());
```


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


## Defining Components

Components are needed to define data on which the whole system can operate.
You can think of them like columns in a database.
Any serialize-able object may be a component in sim-ecs.

```typescript
class Counter {
    a = 0;
}
```

In case you have advanced components, it is possible to pass a serializer and deserializer
to the entity builder later on. If you don't do so, it is assumed that the component is a simple data struct.
You can also use a default-type de-/serializer on save/load, which allows for a variety of standard types (such as `Date`) as components.


## Adding Entities

Entities are like glue. They define which components belong together and form one data.
Entities are automatically added to the world they are built in.
You can think of entities like rows in a database.

```typescript
world.commands.buildEntity().withComponent(Counter).build();
```


## Working with States (optional)

States allow for splitting up a simulation into different logical parts.
In games, that's for example "Menu", "Play" and "Pause".
States can be switched using a push-down automaton.
States define which systems should run, so that a pause-state can run graphics updates, but not game-logic, for example.
If no state is passed to the dispatcher, all systems are run by default.

While the world is running (using `run()`), the state can be changed using commands.
Single calls to `dispatch()` do not offer the benefits of a PDA.


## Update loop

The update loop (for example game loop) is what keeps simulations running.
In order to provide an efficient way of driving the ECS, sim-ecs offers its own built-in loop:

```typescript
world.run() // run() will drive the simulation based on the data provided to set up the world
    .catch(console.error) // this won't catch non-fatal errors, see error example!
    .then(() => console.log('Finished.'));
```

While this is the recommended way to drive a simulation, sim-ecs also offers a step-wise execution: `world.dispatch()`.
Note, though, that each step will need to run the preparation logic, which introduces overhead!


## Commands

Commands, accessible using `world.commands` and `actions.commands` in Systems, are a mechanism,
which queues certain functionality, like adding entities.
The queue is then worked on at certain sync points, usually at the end of every step.
This is a safety and comfort mechanism, which guarantees that critical changes can be triggered comfortably,
but still only run at times when it is actually safe to do them.

Such sync points include any major transitions in a step's life-cycle, and sim-ecs will always trigger the execution
of all queued commands at the end of the step.


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
        Position: <Position>{
            x: 0,
            y: 1,
        },
        Player: <Player>{
            level: 1,
            name: 'Jane',
        },
        Health: <Health>{
            current: 100,
            max: 100,
        },
    },
    {
        Position: <Position>{
            x: 0,
            y: 1,
        },
        Monster: <Monster>{
            hostileToPlayer: true,
            type: MonsterTypes.Tiger,
        },
        Health: <Health>{
            current: 100,
            max: 250,
        }
    },
];


// to load from JSON, use SerialFormat.fromJSON() instead!
const prefabHandle = world.commands.load(SerialFormat.fromArray(prefab));

// ...

// unloading is also easily possible to clean up the world
world.commands.unloadPrefab(prefabHandle);
```

```typescript
// saving a prefab from the current world. This may be used to write an editor
// or export a PoC for game designers to improve on
const jsonPrefab = world.save().toJSON(4);
saveToFile(jsonPrefab, 'prefab.json');
```

```typescript
// filtering what should be saved is also possible,
// so that only certain data is saved and not all data of the whole world
const saveData = world.save(queryEntities(With(Player))).toJSON();
localStorage.setItem('save', saveData);
```


## Syncing instances

In order to keep several instances in sync, sim-ecs provides tooling.
Especially when writing networked simulations, it is very important to keep certain entities in sync.

```typescript
// OPTIONALLY initialize UUID mechanism
import {uuid} from 'your-favorit-uuid-library';
Entity.uuidFn = uuid; // type: () => string

// at the source, entities can be created as normal
const entity = world.buildEntity().build();

// IDs are created lazily when getting them for the first time
const entityId = entity.id;

// on another instance, you can assign the entity ID on entity creation:
const syncedEntity = world.buildEntity(entityId).build();

// in order to fetch an entity with a given ID, the ECS's function can be used
const entityFromIdGetter = getEntity(entityId);
// or inside a Query:
const {entityFromIdQuery} = queryComponents({ entityFromIdQuery: ReadEntity(entityId) }).getFirst();
```


## Building for Production

When building for production, it is important to keep class names.
Some minimizers need to be adjusted. For example WebPack (using Terser) needs to pass this as configuration.
The Pong example uses WebPack and demonstrates how to set up WebPack for proper production usage (in `make.js`).


## Comparison with other TS ECS libs

In an attempt to make sim-ecs best in class, it is important to compare it to other ECS libraries,
identify differences and improve based on lessons others already learned.
That's why a comparison to other libraries is tracked here, as fair as possible!
Please open a PR for any improvement!


### Features

|                                                       Feature | sim-ecs | bitecs | tick-knock | ape-ecs |
|--------------------------------------------------------------:| :---: | :---: | :---: | :---: |
|                                                    Data first | x | x* | | |
| Batteries included (Prefabs, Events, Complex Scheduler, etc.) | x | | | |
|                                 Full typing/intention support | x | | x | | 
|                         Everything can be used as a Component | x | | x | |
|        Consistency check at transpile time (thanks to typing) | x | | | | 
|                                            Full async-support | x | | | |
|                                             Save / Load world | x | | | x |
|                                              State Management | x | | | |

\* only works with numeric fields on components

### Performance

Please take the results with a grain of salt. These are benchmarks, so they are synthetic.
An actual application will use a mix out of everything and more, and depending on that may have a different experience.

Date: 19th January 2022

```
--------------------------------------------------------------------------------
TypeScript ECS Bench
--------------------------------------------------------------------------------

Platform: Windows_NT win32 x64 v10.0.22000
CPU: AMD Ryzen 7 3700X 8-Core Processor@3600MHz
NodeJS: v18.9.1

Bench           v0.2.0
TypeScript      v4.8.3
TS-Lib          v2.4.0
TS-Node         v10.9.1

Ape-ECS         v1.3.1
bitecs          v0.3.38
sim-ecs         v0.6.0
tick-knock      v4.1.0



 Default Suite / Simple Insert
--------------------------------
    Ape-ECS 86 ops/s ± 0.32%
    bitecs 536 ops/s ± 1.0%
    sim-ecs 136 ops/s ± 1.7%
    tick-knock 603 ops/s ± 1.1%



 Default Suite / Simple Iter
--------------------------------
    Ape-ECS 162 ops/s ± 0.092%
    bitecs 1135 ops/s ± 0.34%
    sim-ecs 117151 ops/s ± 1.1%
    tick-knock 39 ops/s ± 0.29%



 Default Suite / Serialize
--------------------------------
Ape-ECS SerializeSave file size: 417.3427734375 KB
    Ape-ECS 69 ops/s ± 1.5%
sim-ecs SerializeSave file size: 78.9951171875 KB
    sim-ecs 121 ops/s ± 1.5%
```
