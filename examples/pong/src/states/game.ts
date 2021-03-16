import {ITransitionActions, State, TPrefabHandle, With} from "sim-ecs";
import {InputSystem} from "../systems/input";
import {PauseSystem} from "../systems/pause";
import {PaddleSystem} from "../systems/paddle";
import {gamePrefab} from "../prefabs/game";
import {EPaddleSide, Paddle} from "../components/paddle";
import {Position} from "../components/position";
import {GameStore} from "../models/game-store";
import {BallSystem} from "../systems/ball";
import {Velocity} from "../components/velocity";
import {load} from "../app/persistence";
import {RenderUISystem} from "../systems/render-ui";
import {RenderGameSystem} from "../systems/render-game";
import {Shape} from "../components/shape";
import {AnimationSystem} from "../systems/animation";
import {UIItem} from "../components/ui-item";
import {ScoreBoard} from "../models/score-board";
import {CollisionSystem} from "../systems/collision";

export class GameState extends State {
    _systems = [AnimationSystem, BallSystem, CollisionSystem, InputSystem, PaddleSystem, PauseSystem, RenderGameSystem, RenderUISystem];
    prefabHandle?: TPrefabHandle;

    activate(actions: ITransitionActions) {
        actions.getResource(GameStore).currentState = this;
    }

    create(actions: ITransitionActions) {
        const gameStore = actions.getResource(GameStore);

        if (gameStore.continue) {
            load(actions);
        }
        else {
            this.prefabHandle = createNewGame(actions);
        }

        setScoreCaptionMod(actions);
        actions.maintain();
    }

    destroy(actions: ITransitionActions) {
        if (this.prefabHandle) {
            actions.unloadPrefab(this.prefabHandle);
        }
    }
}

const createNewGame = function (actions: ITransitionActions) {
    const prefabHandle = actions.loadPrefab(gamePrefab);

    for (const entity of actions.getEntities([With(Paddle), With(Shape)])) {
        entity
            .addComponent(new Position(
                entity.getComponent(Paddle)!.side == EPaddleSide.Left
                    ? 0
                    : 1 - entity.getComponent(Shape)!.dimensions.width,
            ))
            .addComponent(new Velocity());
    }

    return prefabHandle;
}

const setScoreCaptionMod = function (actions: ITransitionActions) {
    const score = actions.getResource(ScoreBoard);

    for (const entity of actions.getEntities([With(Paddle), With(UIItem)])) {
        const ui = entity.getComponent(UIItem)!;
        const paddle = entity.getComponent(Paddle)!;

        if (paddle.side == EPaddleSide.Left) {
            ui.captionMod = strIn => strIn.replace('{}', score.left.toString());
        } else {
            ui.captionMod = strIn => strIn.replace('{}', score.right.toString());
        }
    }
}
