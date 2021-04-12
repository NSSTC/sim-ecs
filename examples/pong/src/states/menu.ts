import {ITransitionActions, State, TPrefabHandle} from "sim-ecs";
import {menuPrefab} from "../prefabs/menu";
import {InputSystem} from "../systems/input";
import {MenuSystem} from "../systems/menu";

export class MenuState extends State {
    _systems = [InputSystem, MenuSystem];
    prefabHandle!: TPrefabHandle;

    create(actions: ITransitionActions) {
        this.prefabHandle = actions.loadPrefab(menuPrefab);
        actions.maintain();
    }

    destroy(actions: ITransitionActions): void | Promise<void> {
        actions.unloadPrefab(this.prefabHandle);
    }
}
