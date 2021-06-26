import {ISystemActions, Query, Read, System} from "sim-ecs";
import {Position} from "../components/position";
import {Shape} from "../components/shape";
import {relToScreenCoords} from "../app/util";


export class RenderGameSystem extends System {
    query = new Query({
        pos: Read(Position),
        shape: Read(Shape)
    });

    ctx!: CanvasRenderingContext2D;
    toScreenCoords!: (x: number, y: number) => [number, number];

    setup(actions: ISystemActions): void | Promise<void> {
        this.ctx = actions.getResource(CanvasRenderingContext2D);
        this.toScreenCoords = relToScreenCoords.bind(undefined, this.ctx.canvas);
    }

    run(actions: ISystemActions) {
        for (const {pos, shape} of this.query.iter()) {
            const screenDim = this.toScreenCoords(shape.dimensions.width, shape.dimensions.height ?? 0);
            const screenPos = this.toScreenCoords(pos.x, pos.y);

            if (!shape.dimensions.height) {
                screenDim[1] = screenDim[0];
            }

            this.ctx.fillStyle = shape.color;
            this.ctx.fillRect(screenPos[0], screenPos[1], screenDim[0], screenDim[1]);
        }
    }
}
