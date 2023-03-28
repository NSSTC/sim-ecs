import {type ISyncPointPrefab} from "sim-ecs";
import {BeforeStepSystem} from "../systems/before-step.ts";
import {InputSystem} from "../systems/input.ts";
import {PauseSystem} from "../systems/pause.ts";
import {RenderGameSystem} from "../systems/render-game.ts";
import {RenderUISystem} from "../systems/render-ui.ts";
import {ErrorSystem} from "../systems/error.ts";


export const pauseSchedule: ISyncPointPrefab = {
    stages: [
        [BeforeStepSystem],
        [InputSystem],
        [PauseSystem],
        [
            RenderGameSystem,
            RenderUISystem,
        ],
        [ErrorSystem],
    ],
};
