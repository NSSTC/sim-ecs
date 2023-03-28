import {type ITransitionActions, SerialFormat, State, type TGroupHandle} from "sim-ecs";
import {pausePrefab} from "../prefabs/pause.ts";
import {GameStore} from "../models/game-store.ts";
import {save} from "../app/persistence.ts";

export class PauseState extends State {
    prefabHandle!: TGroupHandle;

    activate(actions: ITransitionActions) {
        const gameStore = actions.getResource(GameStore);
        save(actions);

        gameStore.currentState = this;
        this.prefabHandle = actions.commands.load(SerialFormat.fromArray(pausePrefab));
        return actions.flushCommands();
    }

    deactivate(actions: ITransitionActions) {
        actions.commands.removeGroup(this.prefabHandle);
        return actions.flushCommands();
    }
}
