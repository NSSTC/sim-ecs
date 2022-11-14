import {type ISyncPointPrefab} from "sim-ecs";
import {BeforeStepSystem} from "../systems/before-step";
import {InputSystem} from "../systems/input";
import {PauseSystem} from "../systems/pause";
import {RenderGameSystem} from "../systems/render-game";
import {RenderUISystem} from "../systems/render-ui";
import {ErrorSystem} from "../systems/error";


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
