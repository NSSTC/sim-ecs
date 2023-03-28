import {type ITransitionActions, SerialFormat, State, type TGroupHandle} from "sim-ecs";
import {menuPrefab} from "../prefabs/menu.ts";
import {GameStore} from "../models/game-store.ts";

export class MenuState extends State {
    prefabHandle!: TGroupHandle;

    activate(actions: ITransitionActions) {
        actions.getResource(GameStore).currentState = this;
        this.prefabHandle = actions.commands.load(SerialFormat.fromArray(menuPrefab));
        return actions.flushCommands();
    }

    deactivate(actions: ITransitionActions) {
        actions.commands.removeGroup(this.prefabHandle);
        return actions.flushCommands();
    }
}
