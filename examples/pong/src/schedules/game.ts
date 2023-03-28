import {type ISyncPointPrefab} from "sim-ecs";
import {BeforeStepSystem} from "../systems/before-step.ts";
import {MenuSystem} from "../systems/menu.ts";
import {PaddleSystem} from "../systems/paddle.ts";
import {PauseSystem} from "../systems/pause.ts";
import {CollisionSystem} from "../systems/collision.ts";
import {BallSystem} from "../systems/ball.ts";
import {AnimationSystem} from "../systems/animation.ts";
import {RenderGameSystem} from "../systems/render-game.ts";
import {RenderUISystem} from "../systems/render-ui.ts";
import {InputSystem} from "../systems/input.ts";
import {ErrorSystem} from "../systems/error.ts";


export const gameSchedule: ISyncPointPrefab = {
    stages: [
        [BeforeStepSystem],
        [InputSystem],
        [
            MenuSystem,
            PaddleSystem,
            PauseSystem,
        ],
        [CollisionSystem],
        [BallSystem],
        [AnimationSystem],
        [
            RenderGameSystem,
            RenderUISystem,
        ],
        [ErrorSystem],
    ],
};
