import {createSystem, hmrSwapSystem, queryComponents, Read, Storage, WriteResource} from "sim-ecs";
import {Position} from "../components/position.ts";
import {Shape} from "../components/shape.ts";
import {relToScreenCoords} from "../app/util.ts";

export const RenderGameSystem = createSystem({
    ctx: WriteResource(CanvasRenderingContext2D),
    storage: Storage<{ toScreenCoords: (x: number, y: number) => [number, number] }> ({toScreenCoords: () => [0, 0]}),
    query: queryComponents({
        pos: Read(Position),
        shape: Read(Shape)
    })
})
    .withName('RenderGameSystem')
    .withSetupFunction(({ctx, storage}) => {
        storage.toScreenCoords = relToScreenCoords.bind(undefined, ctx.canvas);
    })
    .withRunFunction(({ctx, storage, query}) => {
        return query.execute(({pos, shape}) => {
            const screenDim = storage.toScreenCoords(shape.dimensions.width, shape.dimensions.height ?? 0);
            const screenPos = storage.toScreenCoords(pos.x, pos.y);

            if (!shape.dimensions.height) {
                screenDim[1] = screenDim[0];
            }

            ctx.fillStyle = shape.color;
            ctx.fillRect(screenPos[0], screenPos[1], screenDim[0], screenDim[1]);
        });
    })
    .build();

// @ts-ignore
hmr:if (import.meta.hot) {
    // @ts-ignore
    import.meta.hot.accept(mod => hmrSwapSystem(mod[Object.getOwnPropertyNames(mod)[0]]));
}
