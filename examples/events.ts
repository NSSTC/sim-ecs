import {buildWorld, createSystem, ReadEvents, Storage, WriteEvents} from "../src";

/// This example creates a new event, a system that triggers the event once per second,
/// and a system that prints a message whenever the event is received.

class MyEvent {
    constructor(
        public message: string
    ) {}
}

const EventTriggerSystem = createSystem({
    myEvents: WriteEvents(MyEvent),
    lastEvent: Storage({ timestamp: 0 }),
})
    /// the logic goes here. Just iterate over the data-set and make your relevant changes for a single step
    .withRunFunction(({myEvents, lastEvent}) => {
        if (Date.now() - lastEvent.timestamp >= 1000) {
            myEvents.publish(new MyEvent('My event just happened!'));
            lastEvent.timestamp = Date.now();
        }
    })
    .build();

const EventListenerSystem = createSystem({
    myEvents: ReadEvents(MyEvent),
})
    .withRunFunction(({myEvents}) => {
        let myEvent;
        for (myEvent of myEvents.iter()) {
            console.log(myEvent.message);
        }
    })
    .build();


buildWorld()
    .withDefaultScheduling(root => root
        /// Stages will run after one another, however the systems inside may run in any order and even in parallel
        .addNewStage(stage => stage.addSystem(EventTriggerSystem))
        /// So, if we want to receive the shutdown event on the same step, we need to use a later stage
        .addNewStage(stage => stage.addSystem(EventListenerSystem))
    )
    .build()
    .run()
    .catch(console.error)
    .then(() => console.log('Finished.'));
