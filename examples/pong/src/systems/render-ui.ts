import {Position} from "../components/position.ts";
import {createSystem, hmrSwapSystem, queryComponents, Read, Storage, WriteResource} from "sim-ecs";
import {UIItem} from "../components/ui-item.ts";
import {relToScreenCoords} from "../app/util.ts";

export const RenderUISystem = createSystem({
    ctx: WriteResource(CanvasRenderingContext2D),
    storage: Storage<{ toScreenCoords: (x: number, y: number) => [number, number] }> ({toScreenCoords: () => [0, 0]}),
    query: queryComponents({
        pos: Read(Position),
        ui: Read(UIItem)
    })
})
    .withName('RenderUISystem')
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
            ctx.fillText(getFinalCaption(ui), screenPos[0], screenPos[1]);
        });
    })
    .build();

function getFinalCaption(ui: UIItem): string {
    return ui.captionMod?.(ui.caption) ?? ui.caption;
}

// @ts-ignore
hmr:if (import.meta.hot) {
    // @ts-ignore
    import.meta.hot.accept(mod => hmrSwapSystem(mod[Object.getOwnPropertyNames(mod)[0]]));
}
