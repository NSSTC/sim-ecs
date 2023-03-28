import {Actions, buildWorld, createSystem, ISyncPointPrefab, queryComponents, Write} from "../src/index.ts";


// a component.
// holds our counter and a limit to how far we want to count before stopping
class CounterInfo {
    count = 0;
    limit = 100;
}

// systems process data. We declare what kind of input we need in the struct below,
// and then define the processing code here
const CounterSystem = createSystem({
    // The Actions interface allows access to world-operations, like adding entities or changing the state
    actions: Actions,
    // the query to get all matching entities
    // we can define our own fields. The value is either Write() or Read() of a specific prototype.
    // the fields will be filled with actual objects of the given prototypes during system execution
    query: queryComponents({
        info: Write(CounterInfo),
    }),
})
    // it is useful to also give every System a unique name,
    // which will show up in error messages and help during debugging
    .withName('CounterSystem')
    // the logic goes here. Just iterate over the data-set and make your relevant changes for a single step
    .withRunFunction(({actions, query}) => {
        // there are two ways to go over the query result:
        // 1. you can use regular loops:
        for (const {info} of query.iter()) {
            info.count++;

            // after every ten steps, write out a log message
            if (info.count % 10 == 0) {
                console.log(`The current count is ${info.count} / ${info.limit}!`);
            }

            // if the limit is reached, exit
            if (info.count == info.limit) {
                console.log('Time to exit!');
                /// the commands interface is a safe way to mutate the world, since all changes are always buffered until a good moment,
                /// for example after each step, all commands are applied
                /// doing so makes sure that there are no race conditions between different systems accessing entities simultaneously
                actions.commands.stopRun();
            }
        }

        // 2. at the cost of iteration speed, you can use a callback function, too:
        // query.execute(({info}) => {
        //     info.count++;
        // });
    })
    .build();

// in order to execute all systems in the right order, we can create prefabs for execution schedules
// we can do so by defining what is happening in between sync-points

// sync-points are defined moments in the schedule, when no system runs, and the ECS can sync updates,
//   like adding and removing entities or components, to all system caches.
//   It is useful to keep the amount of these sync-points to a minimum for a speedy execution!
//   The ECS will always have one sync-point, which is the "root" sync-point.
//   This means that syncing will always happen between each step.

// for our simple logic, we only need one sync-point, which will be reached after the below plan has been executed
const executionSchedule: ISyncPointPrefab = {
    // each sync point contains stages, which are work units with a defined (custom or default) scheduler
    stages: [
        // each stage also contains several systems, which are orchestrated by the stage's scheduler
        [
            CounterSystem,
        ],
    ],
};

// then, we need a world which will hold our systems and entities.
// sim-ecs is separated into preparation worlds and runtime worlds.
// They are optimized for different requirements.
// buildWorld() will create the preparation world.
const prepWorld = buildWorld()
    // we can inform the world about our processing logic by adding the above defined prefab
    .withDefaultScheduling(root => root.fromPrefab(executionSchedule))
    // we can register components types at this level in order to enable saving (serialization) and loading (deserialization) of them
    .withComponent(CounterInfo)
    .build();

// in order to do something, we still need to add data, which can be processed.
// think of this like filling up your database, whereas each entity is a row and each component is a column
prepWorld
    /// invoking the entity builder in this way automatically adds the entity to the world
    .buildEntity()
    .with(CounterInfo)
    .build();

(async () => {
    // when everything is added, it's time to run the simulation
    // to do so, a runtime environment must be prepared:
    const runWorld = await prepWorld.prepareRun();

    // sim-ecs provides an optimized main-loop, but can also do single steps
    await runWorld.start();
})().catch(console.error).then(() => console.log('Finished.'));
