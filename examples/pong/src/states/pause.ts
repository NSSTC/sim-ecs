import {ITransitionActions, SerialFormat, State, TGroupHandle} from "sim-ecs";
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
        actions.commands.maintain();
    }

    deactivate(actions: ITransitionActions) {
        actions.commands.unloadPrefab(this.prefabHandle);
        actions.commands.maintain();
    }
}
