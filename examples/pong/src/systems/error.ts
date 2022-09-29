import {createSystem, ReadEvents, SystemError} from "sim-ecs";

export const ErrorSystem = createSystem({
    errors: ReadEvents(Error),
    systemErrors: ReadEvents(SystemError),
}).withRunFunction(({errors, systemErrors}) => {
    let error;

    for (error of errors.iter()) {
        console.error('HANDLED ERROR!', error);
    }

    for (error of systemErrors.iter()) {
        console.error('HANDLED ERROR! System:', error.System, '; Cause:', error.cause);
    }
}).build();
