import {ECS, ISystemActions, Query, System, Write} from "..";


/// a component.
/// holds our counter and a limit to how far we want to count before stopping
class CounterInfo {
    count = 0;
    limit = 100;
}

/// systems process data. We declare what kind of input we need in the above Data struct,
/// and then define the processing code here
class CounterSystem extends System {
    /// our data-structure we want to use to interact with the world
    /// we can define our own fields. The value is either Write() or Read() of a specific prototype.
    /// the fields will be filled with actual objects of the given prototypes during system execution
    query = new Query({
        info: Write(CounterInfo),
    });

    /// the logic goes here. Just iterate over the data-set and make your relevant changes for a single step
    run(actions: ISystemActions) {
        /// there are two ways to go over the query result:
        /// 1. you can use a regular loop
        for (const {info} of this.query.iter()) {
            info.count++;

            // after every ten steps, write out a log message
            if (info.count % 10 == 0) {
                console.log(`The current count is ${info.count} / ${info.limit}!`);
            }

            // if the limit is reached, set the exit field to true
            if (info.count == info.limit) {
                console.log('Time to exit!');
                actions.commands.stopRun();
            }
        }

        /// 2. you can use a callback function:
        // this.query.execute(({info}) => {
        //     ...
        // });
    }
}

/// with everything defined, let's implement the setup code
/// everything starts with the ECS initialization
const ecs = new ECS();
/// then, we need a world which will hold our systems and entities
const world = ecs
    .buildWorld()
    /// we can inform the world about our processing logic by adding the above defined system
    .withSystem(CounterSystem)
    /// we can register components types at this level in order to enable saving (serialization) and loading (deserialization) of them
    .withComponent(CounterInfo)
    .build();

/// in order to do something, we still need to add data, which can be processed.
/// think of this like filling up your database, whereas each entity is a row and each component is a column
world
    .commands
    .buildEntity()
    .with(CounterInfo)
    .build();

/// when everything is added, it's time to run the simulation
/// sim-ecs provides a main-loop, which is optimized for iteration speed of the systems and data
/// it is highly recommended to use it:
world.run().catch(console.error).then(() => console.log('Finished.'));
