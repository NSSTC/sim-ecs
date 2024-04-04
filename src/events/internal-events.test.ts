import {buildWorld} from "../ecs/ecs-world";
import {Actions, createSystem, ReadEvents} from "../system/system";
import {SimECSAddEntityEvent} from "./internal-events";
import {Entity} from "../entity/entity";
import {assert} from "chai";

describe('Test internal events', () => {
    it('Entity added', async () => {
        // Count the number of times the add entity event was fired and read
        let firedCount = 0;
        // Count the amount of steps we already did
        let loopCounter = 0;

        // Will listen for added entity events
        // and add to the firedCount
        const EventListenerSystem = createSystem({
            myEvents: ReadEvents(SimECSAddEntityEvent),
        }).withRunFunction(({myEvents}) => {
            myEvents.execute(() => {
                firedCount++
            });
        }).build();

        // Will add entities
        const EventTriggerSystem = createSystem({
            actions: Actions,
        }).withRunFunction(async ({actions}) => {
            actions.commands.addEntity(new Entity());
        }).build();

        // Will count the number of steps we took and end the simulation
        const LoopCounterSystem = createSystem({
            actions: Actions,
        }).withRunFunction(({ actions }) => {
            loopCounter++;
            if (loopCounter >= 3) {
                actions.commands.stopRun();
            }
        }).build();

        const prepWorld = buildWorld()
            .withDefaultScheduling(root => root
                .addNewStage(stage => stage
                    .addSystem(EventTriggerSystem)
                    .addSystem(EventListenerSystem)
                    .addSystem(LoopCounterSystem)
                )
            )
            .build();

        const runWorld = await prepWorld.prepareRun();

        // Start and await the end of the simulation
        await runWorld.start();

        assert.equal(loopCounter, 3, 'Did not get to three steps exactly!');
        // Since entities are added after the step, the first step will not fire an event,
        // so the number of events will always be one smaller than the number of steps.
        assert.equal(firedCount, loopCounter - 1, 'Not all added entities fired an event!');
    });
});
