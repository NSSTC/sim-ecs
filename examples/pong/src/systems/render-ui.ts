import {Position} from "../components/position";
import {createSystem, queryComponents, Read, Storage, WriteResource} from "sim-ecs";
import {UIItem} from "../components/ui-item";
import {relToScreenCoords} from "../app/util";

export const RenderUISystem = createSystem({
    ctx: WriteResource(CanvasRenderingContext2D),
    storage: Storage<{ toScreenCoords: (x: number, y: number) => [number, number] }> ({toScreenCoords: () => [0, 0]}),
    query: queryComponents({
        pos: Read(Position),
        ui: Read(UIItem)
    })
})
    .withSetupFunction(({ctx, storage}) => {
        storage.toScreenCoords = relToScreenCoords.bind(undefined, ctx.canvas);
    })
    .withRunFunction(({ctx, storage, query}) => {
        ctx.textBaseline = 'top';

        return query.execute(({pos, ui}) => {
            const screenPos = storage.toScreenCoords!(pos.x, pos.y);

            ctx.fillStyle = ui.active
                ? ui.activeColor ?? 'red'
                : ui.color;
            ctx.font = ui.active
                ? `${ui.fontSize * 1.2}px serif`
                : `${ui.fontSize}px serif`;
            ctx.fillText(ui.finalCaption, screenPos[0], screenPos[1]);
        });
    })
    .build();