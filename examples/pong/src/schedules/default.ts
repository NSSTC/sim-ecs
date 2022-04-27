import {ISyncPointPrefab} from "sim-ecs";
import {BeforeStepSystem} from "../systems/before-step";
import {MenuSystem} from "../systems/menu";
import {PaddleSystem} from "../systems/paddle";
import {PauseSystem} from "../systems/pause";
import {CollisionSystem} from "../systems/collision";
import {BallSystem} from "../systems/ball";
import {AnimationSystem} from "../systems/animation";
import {RenderGameSystem} from "../systems/render-game";
import {RenderUISystem} from "../systems/render-ui";


export const defaultSchedule: ISyncPointPrefab = {
    stages: [
        [BeforeStepSystem],
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
    ],
};
