import {ISystemActions, Read, System, SystemData} from "../ecs";
import {Position} from "../components/position";
import {Shape} from "../components/shape";
import {relToScreenCoords} from "../app/util";

class Data extends SystemData {
    readonly pos = Read(Position)
    readonly shape = Read(Shape)
}

export class RenderGameSystem extends System<Data> {
    SystemDataType = Data;
    ctx!: CanvasRenderingContext2D;
    toScreenCoords!: (x: number, y: number) => [number, number];

    setup(actions: ISystemActions): void | Promise<void> {
        this.ctx = actions.getResource(CanvasRenderingContext2D);
        this.toScreenCoords = relToScreenCoords.bind(undefined, this.ctx.canvas);
    }

    run(dataSet: Set<Data>): void | Promise<void> {
        for (const {pos, shape} of dataSet) {
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
