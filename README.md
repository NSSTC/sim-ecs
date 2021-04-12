# sim-ecs
Type-based, Components-first ECS, which is optimized for simulation needs. Will run in NodeJS and the browser.


- [Considerations](#considerations)
- [Examples](#examples)
  - [Counter](#counter)
  - [Pong](#pong)  
- [Defining Systems](#defining-systems)
- [Creating the ECS and a World](#creating-the-ecs-and-a-world)
- [Setting Resources](#setting-resources)
- [Defining Components](#defining-components)
- [Adding Entities](#adding-entities)
- [Working with States](#working-with-states-optional)
- [Update loop](#Update-loop)
- [Using Prefabs](#using-prefabs)  
- [Save and Load a World](#save-and-load-a-world)
- [Comparison with other TS ECS libs](#comparison-with-other-ts-ecs-libs)
  - [Features](#features)
  - [Performance](#performance)  


## Considerations

This ECS is inspired by SPECS, Legion and bevy-ecs (three Rust ECS libraries), however optimized for JS.
It is built for easy usage (DX) and high iteration speed.
The trade-off is that insertion and deletion are slow,
however there are optimizations and opinionations in place to still make it fast.
I recommend doing insertions and deletions at defined points (for example loading screens)
and batching these operations.
For on-the-fly changes, there is a way to register a callback which does the work
in between system executions, so that all systems can work on the same dataset per iteration.

In order to allow reproducible simulations, all systems operate on cached data-sets.
Changes to entities are propagated on the next system execution (for example one frame lagging behind creation).
It is hence not recommended to use entities to propagate messages in between systems.


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


## Defining Systems

Systems are the logic, which operates on data sets (components).
They are logic building blocks which separate concerns and make the world move.

```typescript
class Data extends SystemData{ counterObj = Write(Counter) }
class CountSystem extends System<Data> {
    readonly SystemData = Data;

    // update() is called every time the world needs to be updated. Put your logic in there
    async run(dataSet: Set<Data>): Promise<void> {
        for (let data of dataSet) {
            console.log(++data.counterObj.a);
        }
    }
}
```


## Creating the ECS and a World

In an ECS, a world is like a container for entities.

```typescript
const ecs = new ECS();
const world = ecs.buildWorld().withSystem(CountSystem).build();
```


## Setting Resources

Resources are objects, which can hold certain data, like the start DateTime.

```typescript
// this call implicitely creates a new object of type Date. You can also pass an instance instead.
// you can pass arguments to the constructor by passing them as additional parameters here
world.addResource(Date);
console.log(world.getResource(Date).getDate());
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
world.buildEntity().withComponent(Counter).build();
```


## Working with States (optional)

States allow for splitting up a simulation into different logical parts.
In games, that's for example "Menu", "Play" and "Pause".
States can be switched using a push-down automaton.
States define which systems should run, so that a pause-state can run graphics updates, but not game-logic, for example.
If no state is passed to the dispatcher, all systems are run by default.

While the world is running (using `run()`), the state can be changed between every world dispatch
using the handler function. Single calls to `dispatch()` do not offer the benefits of a PDA.

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


## Using Prefabs

Prefabs, short for pre-fabrications, are ready-made files or objects,
which can be loaded at runtime to initialize a certain part of the application.
In the case of sim-ecs, prefabs can be used to load entities with their components.
Contrary to a save, for example using `world.toJSON()`, prefabs are made with work-flow in mind.
Their format is easy to understand, even by non-programmers, and they can be enriched with types easily (see Pong example).

Another advantage of prefabs in sim-ecs is that all loaded entities are tracked and can be unloaded when not needed anymore.
This means that prefabs can be used to design menus, levels, GUIs, etc. which are only loaded when needed
and discarded after use. After all, who needs level1 data when they switched over to level2?

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
        },
        Player: {
            name: 'Jane',
            health: 100,
        },
    },
    {
      Position: {
        x: 0,
        y: 1,
      },
      Monster: {
          type: MonsterTypes.Tiger,
          health: 250,
      },
    }, 
];

const prefabHJandle = world.loadPrefab(prefab);
world.unloadPrefab(prefabHandle);
```

```typescript
// saving a prefab from the current world. This may be used to write an editor
// or export a PoC for game designers to improve on
const jsonPrefab = JSON.stringify(world.toPrefab(), undefined, 4);
saveToFile(jsonPrefab, 'prefab.json');
```


## Save and Load a World

It is possible to save and load entities of an entire world.
Saving a world is as simple as calling `toJSON()` on it in order to receive a JSON string representing the world.
This string can be saved to the file system, browser storage or sent over the network.

```typescript
localStorage.setItem('save0', world.toJSON());
```

There is no version or upgrade management done by the ECS, though, and we highly recommend to implement it based on your needs.

In order to load a saved world, the json string can be fed to the world builder during creation:

```typescript
new ECS().buildWorld().fromJSON(localStorage.getItem('save0')).build();
```

In order to correctly initialize all components, a deserializer-function may be provided.
At this point, the data can also be manipulated, for example updating timestamps in components.
Usually, though, registering the Components is enough for sim-ecs to correctly handle deserialization.


## Comparison with other TS ECS libs

In an attempt to make sim-ecs best in class, it is important to compare it to other ECS libraries,
identify differences and improve based on lessons others already learned.
That's why a comparison to other libraries is tracked here, as fair as possible!
Please open a PR for any information improvement!


### Features

| Feature | sim-ecs | tick-knock | ape-ecs |
| ---: | :---: | :---: | :---: |
| Data first | x | | |
| Everything is a Component | x | x | |
| Full async-support | x | | |
| Functional Systems | | | |
| Query-objects | | x | x |
| Save / Load world | x | | x |
| Load prefabs | x | | x |
| State Management | x | | |


### Performance

Please take the results with a grain of salt. These are benchmarks, so they are synthetic.
An actual application will use a mix out of everything and more, and depending on that may have a different experience.

Date: 12th April 2021

```
--------------------------------------------------------------------------------
TypeScript ECS Bench
--------------------------------------------------------------------------------

Platform: Windows_NT win32 x64 v10.0.19042
CPU: AMD Ryzen 7 3700X 8-Core Processor@3600MHz

Bench           v0.1.0
TypeScript      v4.2.4
TS-Lib          v2.2.0
TS-Node         v9.1.1

Ape-ECS         v1.3.1
sim-ecs         v0.3.0
tick-knock      v3.0.1
```

| | Ape-ECS | sim-ecs | tick-knock |
| ---: | :---: | :---: | :---: |
| Simple Insert | 66 ops/s, ±4.87% | 203 ops/s, ±4.35% | **297 ops/s, ±40.74%** |
| Simple Iteration | 144 191 ops/s, ±13.81% | **1 921 343 ops/s, ±4.47%** | 32 900 ops/s, ±0.19% |
| Schedule | 673 ops/s, ±0.61%  | **1 294 092 ops/s, ±6.65%** | 304 ops/s, ±1.96% |
| De-/Serialize Prefab | 75 ops/s, ±3.21% | **143 ops/s, ±1.51%** | - |
| De-/Serialize Save | 67 ops/s, ±5.20% (445.31KB) | **143 ops/s, ±0.23%** (**75.20KB**) | - |
