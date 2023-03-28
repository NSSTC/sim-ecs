import {type ISyncPointPrefab} from "sim-ecs";
import {BeforeStepSystem} from "../systems/before-step.ts";
import {MenuSystem} from "../systems/menu.ts";
import {RenderGameSystem} from "../systems/render-game.ts";
import {RenderUISystem} from "../systems/render-ui.ts";
import {InputSystem} from "../systems/input.ts";
import {ErrorSystem} from "../systems/error.ts";


export const defaultSchedule: ISyncPointPrefab = {
    stages: [
        [BeforeStepSystem],
        [InputSystem],
        [MenuSystem],
        [
            RenderGameSystem,
            RenderUISystem,
        ],
        [ErrorSystem],
    ],
};
