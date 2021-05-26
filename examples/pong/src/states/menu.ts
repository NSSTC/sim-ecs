import {ITransitionActions, SerialFormat, State, TGroupHandle} from "sim-ecs";
import {menuPrefab} from "../prefabs/menu";
import {InputSystem} from "../systems/input";
import {MenuSystem} from "../systems/menu";
import {RenderUISystem} from "../systems/render-ui";
import {GameStore} from "../models/game-store";

export class MenuState extends State {
    _systems = [InputSystem, MenuSystem, RenderUISystem];
    prefabHandle!: TGroupHandle;

    activate(actions: ITransitionActions) {
        actions.getResource(GameStore).currentState = this;
        this.prefabHandle = actions.commands.load(SerialFormat.fromArray(menuPrefab));
        actions.commands.maintain();
    }

    deactivate(actions: ITransitionActions) {
        actions.commands.unloadPrefab(this.prefabHandle);
        actions.commands.maintain();
    }
}
