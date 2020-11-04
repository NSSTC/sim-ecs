import {ITransitionActions, State, TPrefabHandle} from "../ecs";
import {InputSystem} from "../systems/input";
import {PauseSystem} from "../systems/pause";
import {pausePrefab} from "../prefabs/pause";
import {PaddleSystem} from "../systems/paddle";
import {GameStore} from "../app/game-store";
import {BallSystem} from "../systems/ball";

export class PauseState extends State {
    _systems = [BallSystem, InputSystem, PaddleSystem, PauseSystem];
    prefabHandle!: TPrefabHandle;


    activate(actions: ITransitionActions): void | Promise<void> {
        actions.getResource(GameStore).pause = true;
    }

    create(actions: ITransitionActions) {
        this.prefabHandle = actions.loadPrefab(pausePrefab);
        actions.maintain();
    }

    deactivate(actions: ITransitionActions): void | Promise<void> {
        actions.getResource(GameStore).pause = false;
    }

    destroy(actions: ITransitionActions): void | Promise<void> {
        actions.unloadPrefab(this.prefabHandle);
    }
}
