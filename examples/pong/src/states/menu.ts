import {ITransitionActions, SerialFormat, State, TPrefabHandle} from "sim-ecs";
import {menuPrefab} from "../prefabs/menu";
import {InputSystem} from "../systems/input";
import {MenuSystem} from "../systems/menu";
import {RenderUISystem} from "../systems/render-ui";
import {GameStore} from "../models/game-store";

export class MenuState extends State {
    _systems = [InputSystem, MenuSystem, RenderUISystem];
    prefabHandle!: TPrefabHandle;

    activate(actions: ITransitionActions): void | Promise<void> {
        actions.getResource(GameStore).currentState = this;
        this.prefabHandle = actions.load(SerialFormat.fromArray(menuPrefab));
        actions.maintain();
    }

    deactivate(actions: ITransitionActions): void | Promise<void> {
        actions.unloadPrefab(this.prefabHandle);
    }
}
