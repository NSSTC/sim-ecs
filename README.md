# sim-ecs
ECS, which is optimized for simulations

I highly advice you to take a look at the examples in the `/examples` directory 
and test runners in `/tests`.
The counter example is the most basic one and shows you how to get a world up and running quickly.


## Considerations

This ECS is inspired by SPECS and Legion (two rust ECS libraries), however optimized for JS.
It is built for easy usage (DX) and high iteration speed.
The trade-off is that insertion and deletion are slow,
however there are optimizations and opinionations in place to still make it fast.
I recommend doing insertions and deletions at defined points (for example loading screens)
and batching these operations.
For on-the-fly changes, there is a way to register a callback which does the work
in between system executions, so that all systems can work on the same dataset per iteration. 


## Defining systems

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


## Creating the ECS and a world

In an ECS, a world is like a container for entities.

```typescript
const ecs = new ECS();
const world = ecs.buildWorld().withSystem(new CountSystem()).build();
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


## Adding entities

Entities are like glue. They define which components belong together and form one data.
Entities are automatically added to the world they are built in.
You can think of entities like rows in a database.

```typescript
world.buildEntity().withComponent(Counter).build();
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

However, sim-ecs has to do a lot of calculations on each dispatch,
so it offers its own `run()` method, which is optimized for continuously executing the system logic.
It is the recommended way of running the ECS for simulations!

```typescript
world.run();
```

The run-method can be fed an options object to further configure the runner,
and from within a transition-handler or the systems, certain actions can be called
which influence how the runner acts. For example on transition, the state can be changed.


## Save and load a world

It is possible to save and load entities of an entire world.
Saving a world is as simple as calling `toJSON()` on it in order to receive a JSON string representing the world.
This string can be saved to the file system, browser storage or sent over the network.

```typescript
localStorage.setItem('save0', world.toJSON());
```

There is no version or upgrade management done by the ECS, though, and we highly recommend to implement it based on your needs.

In order to load a saved world, the json string can be fed to the world builder during creation.
In order to correctly initialize all components, a deserializer-function has to be provided.
The function takes the constructor name and the parsed data-blob and returns the initialized object.

```typescript
ecs.buildWorld().fromJSON(jsonSave, (cn, data) => {
    switch (cn) {
        case Counter.name: {
            const c = new Counter();
            c.a = data.a;
            return c;
        }
        case Date.name: {
            return new Date(data);
        }
        default: {
            throw new Error('Unknown constructor name: ' + cn);
        }
    }
}).build();
```

At this point, the data may also be manipulated, for example updating time-stamps.
Note that all components must be re-instantiated in order to set up the correct constructor and prototype chain.
