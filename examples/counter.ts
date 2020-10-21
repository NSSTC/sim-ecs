import {ECS} from "..";
import {ISystemActions, System, SystemData, Write} from "../src";

/// we can define a global storage, which holds general information about the simulation run
/// we will add it as a resource to the ecs world, so that we can access it from anywhere easily
class GlobalStorage {
    exit = false;
}

/// holds our counter and a limit to how far we want to count before stopping
class CounterInfo {
    count = 0;
    limit = 100;
}

/// our data-structure we want to use to interact with the world
/// we can define our own fields. The value is either Write() or Read() of a specific prototype.
/// the fields will be filled with actual objects of the given prototypes during system execution
class Data extends SystemData {
    counterInfo = Write(CounterInfo);
}

/// systems process data. We declare what kind of input we need in the above Data struct,
/// and then define the processing code here
class CounterSystem extends System<Data> {
    protected globalStorage!: GlobalStorage;
    /// we have to link the prototype for JS explicitly
    readonly SystemDataType = Data;

    setup(actions: ISystemActions): void {
        this.globalStorage = actions.getResource(GlobalStorage);
    }

    /// the logic goes here. Just iterate over the data-set and make your relevant changes for a single step
    async run(dataSet: Set<Data>): Promise<void> {
        let counterInfo;
        for ({counterInfo} of dataSet) {
            counterInfo.count++;

            // after every ten steps, write out a log message
            if (counterInfo.count % 10 == 0) {
                console.log(`The current count is ${counterInfo.count} / ${counterInfo.limit}!`);
            }

            // if the limit is reached, set the exit field to true
            if (counterInfo.count == counterInfo.limit) {
                console.log('Time to exit!');
                this.globalStorage.exit = true;
            }
        }
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

/// let's add out global storage as resource to the world. The ECS can do the object instantiation for you,
/// however you may also pass an object instead
world.addResource(new GlobalStorage());

/// in order to do something, we still need to add data, which can be processed.
/// think of this like filling up your database, whereas each entity is a row and each component is a column
world
    /// building an entity is a comfy way to add all components to it and have it in the world in one chain
    .buildEntity()
    .with(new CounterInfo())
    .build();

/// when everything is added, it's time to run the simulation
/// sim-ecs provides a main-loop, which is optimized for iteration speed of the systems and data
/// it is highly recommended to use it
world.run({
    /// this callback is executed after every complete run of all requested systems
    /// use it in order to do changes to the world, like adding, deleting or modifying entities
    transitionHandler: async actions => {
        /// in this example, though, we use it to stop the simulation
        if (actions.getResource(GlobalStorage).exit) {
            actions.stopRun();
        }
    }
}).catch(console.error);
