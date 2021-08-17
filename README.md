# sim-ecs
Type-based, Components-first ECS, which is optimized for simulation needs. Will run in NodeJS and the browser.

```
npm install sim-ecs
```

---


- [Considerations](#considerations)
- [Why use sim-ecs](#why-use-sim-ecs)
- [Examples](#examples)
  - [Counter](#counter)
  - [Pong](#pong)
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


## Examples

For quickly seeing the ECS in action, there are two examples available: A counter and a game of Pong.
You can find them in the `/examples` directory.


### Counter

The counter example is a very small, minimal example to get a quick overview.
It increases a number a few times and then terminates. You can run it using:

```
$ npm run counter
``` 


### Pong

Pong is a full game which can be run in the browser. It demonstrates all features of sim-ecs.
It comes with numerous components and systems, handles states and makes use of prefabs and saves.
Since it is an ECS demo, other parts of the game code may be minimal, like rendering and sound.
It is recommended to use readily available libraries for these parts for any real endeavour, like BabylonJS.

You will need to build Pong from its directory.
Then, you can open the `index.html` in the public folder to run the game.  


## Where is the Documentation

Anything which is not explained in detail enough in this README can be found in the code.
You will notice that there are spec-files. These contain the specification for a certain class,
which usually means an interface with comments on what the methods do.


## Creating the ECS and a World

In an ECS, a world is like a container for entities.

```typescript
const world = buildWorld().withSystem(CountSystem).build();
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
class CountSystem extends System {
    readonly query = new Query({ counterObj: Write(Counter) });

    // update() is called every time the world needs to be updated. Put your logic in there
    run() {
        this.query.execute(({counterObj}) => {
          console.log(++counterObj.a);
        });
    }
}
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
to the entity builder later on. If you don't do so, it is assumed that the component is a simple key:value map.
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

```typescript
class InitState extends State { _systems = [InitSystem] }
class RunState extends State { _systems = [GravitySystem] }
class PauseState extends State { _systems = [PauseSystem] }

world.dispatch(InitState);
world.run({ initialState: RunState });
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

However, sim-ecs has to do a lot of calculations on each dispatch,
so it offers its own `run()` method, which is optimized for continuously executing the system logic.
It is the recommended way of running the ECS for simulations!

```typescript
world.run();
```

The run-method can be fed an options object to further configure the runner,
and from within a transition-handler or the systems, certain actions can be called
which influence how the runner acts. For example on transition, the state can be changed.


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
const saveData = world.save(new Query([With(Player)])).toJSON();
localStorage.setItem('save', saveData);
```


## Syncing instances

In order to keep several instances in sync, sim-ecs provides tooling.
Especially when writing networked simulations, it is very important to keep certain entities in sync.

```typescript
// initialize UUID mechanism
import {uuid} from 'your-favorit-uuid-library';
Entity.uuidFn = uuid;

// at the source, entities can be created as normal
const entity = world.buildEntity().build();

// IDs are created lazily when getting them for the first time
const entityId = entity.id;

// on another instance, you can assign the entity ID on entity creation:
const syncedEntity = world.buildEntity(entityId).build();

// in order to fetch an entity with a given ID, the ECS's function can be used
const entityFromIdGetter = getEntity(entityId);
// or inside a Query:
const {entityFromIdQuery} = new Query({entityFromIdQuery: ReadEntity(entityId) }).getOne();
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

| Feature | sim-ecs | tick-knock | ape-ecs |
| ---: | :---: | :---: | :---: |
| Data first | x | | |
| Full typing/intention support | x | x | | 
| Everything can be used as a Component | x | x | |
| Consistency check at transpile time (thanks to typing) | x | | | 
| Full async-support | x | | |
| Save / Load world | x | | x |
| Load prefabs | x | | x |
| State Management | x | | |


### Performance

Please take the results with a grain of salt. These are benchmarks, so they are synthetic.
An actual application will use a mix out of everything and more, and depending on that may have a different experience.

Date: 27th June 2021

```
--------------------------------------------------------------------------------
TypeScript ECS Bench
--------------------------------------------------------------------------------

Platform: Windows_NT win32 x64 v10.0.19043
CPU: AMD Ryzen 7 3700X 8-Core Processor@3600MHz

Bench           v0.1.0
TypeScript      v4.3.4
TS-Lib          v2.3.0
TS-Node         v10.0.0

Ape-ECS         v1.3.1
sim-ecs         v0.4.0
tick-knock      v4.0.0
```

| | Ape-ECS | sim-ecs | sim-ecs with callbacks | tick-knock |
| ---: | :---: | :---: | :---: | :---: |
| Simple Insert | 59 ops/s, ±9.66% | **249 ops/s, ±0.34%** | **249 ops/s, ±0.34%** | 238 ops/s, ±34.51% |
| Simple Iteration | 147 ops/s, ±1.67% | 24 001 ops/s, ±59.47% | **1 070 399 ops/s, ±26.58%** | 33 ops/s, ±0.23% |
| Schedule | 1 ops/s, ±0.78%  | 192 309 ops/s, ±146.63% | **917 930 ops/s, ±20.31%** | 0 ops/s, ±0.36% |
| De-/Serialize Save | 61 ops/s, ±11.88% (445.31KB) | **203 ops/s, ±44.30%** (**67.38KB**) | **203 ops/s, ±44.30%** (**67.38KB**) | - |
