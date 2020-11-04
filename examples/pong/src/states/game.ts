import {ITransitionActions, State, TPrefabHandle, With} from "../ecs";
import {InputSystem} from "../systems/input";
import {PauseSystem} from "../systems/pause";
import {PaddleSystem} from "../systems/paddle";
import {gamePrefab} from "../prefabs/game";
import {Paddle} from "../components/paddle";
import {Position} from "../components/position";
import {Ball} from "../components/ball";
import {GameStore} from "../app/game-store";
import {BallSystem} from "../systems/ball";
import {Direction} from "../components/direction";
import {ScoreSystem} from "../systems/score";

export class GameState extends State {
    _systems = [BallSystem, ScoreSystem, InputSystem, PaddleSystem, PauseSystem];
    prefabHandle!: TPrefabHandle;

    create(actions: ITransitionActions) {
        const gameStore = actions.getResource(GameStore);

        this.prefabHandle = actions.loadPrefab(gamePrefab);
        for (const entity of actions.getEntities([With(Paddle)])) {
            entity.addComponent(new Position());
        }

        for (const entity of actions.getEntities([With(Ball)])) {
            entity
                .addComponent(new Position(
                    gameStore.ctx.canvas.width / 2 - entity.getComponent(Ball)!.size / 2,
                    gameStore.ctx.canvas.height / 2 - entity.getComponent(Ball)!.size / 2,
                ))
                .addComponent(new Direction());
        }

        actions.maintain();
    }

    destroy(actions: ITransitionActions): void | Promise<void> {
        actions.unloadPrefab(this.prefabHandle);
    }
}
