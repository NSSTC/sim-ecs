import {Actions, buildWorld, createSystem, ReadEvents, SystemError} from "../src/index.ts";


const ErrorTriggerSystem = createSystem({})
    .withName('ErrorTriggerSystem')
    .withRunFunction(() => {
        throw new Error('I was thrown in a system!');
    })
    .build();

const ErrorHandlerSystem = createSystem({
    actions: Actions,
    errors: ReadEvents(Error),
    systemErrors: ReadEvents(SystemError),
})
    .withName('ErrorHandlerSystem')
    .withRunFunction(({actions, errors, systemErrors}) => {
        let error;
        let foundError = false;

        for (error of errors.iter()) {
            console.error('HANDLED ERROR!', error);
            foundError = true;
        }

        for (error of systemErrors.iter()) {
            console.error('HANDLED ERROR! System:', error.System, '; Cause:', error.cause);
            foundError = true;
        }

        if (foundError) {
            actions.commands.stopRun();
        }
    })
    .build();


const prepWorld = buildWorld()
    .withDefaultScheduling(root => root
        .addNewStage(stage => stage.addSystem(ErrorTriggerSystem))
        .addNewStage(stage => stage.addSystem(ErrorHandlerSystem))
    )
    .build();

(async () => {
    const runWorld = await prepWorld.prepareRun();
    await runWorld.start();
})().catch(console.error).then(() => console.log('Finished.'));
