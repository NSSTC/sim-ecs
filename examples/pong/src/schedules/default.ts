import {type ISyncPointPrefab} from "sim-ecs";
import {BeforeStepSystem} from "../systems/before-step";
import {MenuSystem} from "../systems/menu";
import {RenderGameSystem} from "../systems/render-game";
import {RenderUISystem} from "../systems/render-ui";
import {InputSystem} from "../systems/input";
import {ErrorSystem} from "../systems/error";


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
