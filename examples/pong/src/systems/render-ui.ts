import {Position} from "../components/position";
import {Actions, createSystem, Query, Read, Storage} from "sim-ecs";
import {UIItem} from "../components/ui-item";
import {relToScreenCoords} from "../app/util";
import {GameState} from "../states/game";
import {MenuState} from "../states/menu";
import {PauseState} from "../states/pause";

export const RenderUISystem = createSystem(
    Actions,
    Storage<{
        ctx: CanvasRenderingContext2D,
        toScreenCoords: (x: number, y: number) => [number, number],
    }>(),
    new Query({
        pos: Read(Position),
        ui: Read(UIItem)
    })
)
    .runInStates(GameState, MenuState, PauseState)
    .withSetupFunction((actions, storage) => {
        storage.ctx = actions.getResource(CanvasRenderingContext2D);
        storage.toScreenCoords = relToScreenCoords.bind(undefined, storage.ctx.canvas);
    })
    .withRunFunction((actions, storage, query) => {
        storage.ctx.textBaseline = 'top';

        return query.execute(({pos, ui}) => {
            const screenPos = storage.toScreenCoords(pos.x, pos.y);

            storage.ctx.fillStyle = ui.active
                ? ui.activeColor ?? 'red'
                : ui.color;
            storage.ctx.font = ui.active
                ? `${ui.fontSize * 1.2}px serif`
                : `${ui.fontSize}px serif`;
            storage.ctx.fillText(ui.finalCaption, screenPos[0], screenPos[1]);
        });
    })
    .build();