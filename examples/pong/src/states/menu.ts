import {ITransitionActions, SerialFormat, State, TGroupHandle} from "sim-ecs";
import {menuPrefab} from "../prefabs/menu";
import {GameStore} from "../models/game-store";

export class MenuState extends State {
    prefabHandle!: TGroupHandle;

    activate(actions: ITransitionActions) {
        actions.getResource(GameStore).currentState = this;
        this.prefabHandle = actions.commands.load(SerialFormat.fromArray(menuPrefab));
        actions.commands.maintain();
    }

    deactivate(actions: ITransitionActions) {
        actions.commands.removeGroup(this.prefabHandle);
        actions.commands.maintain();
    }
}
