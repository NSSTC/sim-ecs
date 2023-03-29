import {createSystem, hmrSwapSystem, ReadEvents, SystemError} from "sim-ecs";

export const ErrorSystem = createSystem({
    errors: ReadEvents(Error),
    systemErrors: ReadEvents(SystemError),
})
    .withName('ErrorSystem')
    .withRunFunction(({errors, systemErrors}) => {
        let error;

        for (error of errors.iter()) {
            console.error('HANDLED ERROR!', error);
        }

        for (error of systemErrors.iter()) {
            console.error('HANDLED ERROR! System:', error.System, '; Cause:', error.cause);
        }
    }).build();

// @ts-ignore
hmr:if (import.meta.hot) {
    // @ts-ignore
    import.meta.hot.accept(mod => hmrSwapSystem(mod[Object.getOwnPropertyNames(mod)[0]]));
}
