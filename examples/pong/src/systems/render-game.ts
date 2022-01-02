import {Actions, createSystem, Query, Read, Storage} from "sim-ecs";
import {Position} from "../components/position";
import {Shape} from "../components/shape";
import {relToScreenCoords} from "../app/util";
import {GameState} from "../states/game";
import {PauseState} from "../states/pause";


export const RenderGameSystem = createSystem(
    Actions,
    Storage<{
        ctx: CanvasRenderingContext2D,
        toScreenCoords: (x: number, y: number) => [number, number],
    }>(),
    new Query({
        pos: Read(Position),
        shape: Read(Shape)
    })
)
    .runInStates(GameState, PauseState)
    .withSetupFunction((actions, storage) => {
        storage.ctx = actions.getResource(CanvasRenderingContext2D);
        storage.toScreenCoords = relToScreenCoords.bind(undefined, storage.ctx.canvas);
    })
    .withRunFunction((actions, storage, query) => {
        return query.execute(({pos, shape}) => {
            const screenDim = storage.toScreenCoords(shape.dimensions.width, shape.dimensions.height ?? 0);
            const screenPos = storage.toScreenCoords(pos.x, pos.y);

            if (!shape.dimensions.height) {
                screenDim[1] = screenDim[0];
            }

            storage.ctx.fillStyle = shape.color;
            storage.ctx.fillRect(screenPos[0], screenPos[1], screenDim[0], screenDim[1]);
        });
    })
    .build();
