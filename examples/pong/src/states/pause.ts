import {type ITransitionActions, SerialFormat, State, type TGroupHandle} from "sim-ecs";
import {pausePrefab} from "../prefabs/pause";
import {GameStore} from "../models/game-store";
import {save} from "../app/persistence";

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
