import {Position} from "../components/position";
import {ISystemActions, Read, System, SystemData} from "sim-ecs";
import {UIItem} from "../components/ui-item";
import {relToScreenCoords} from "../app/util";

class Data extends SystemData {
    readonly pos = Read(Position);
    readonly ui = Read(UIItem);
}

export class RenderUISystem extends System<Data> {
    SystemDataType = Data;
    ctx!: CanvasRenderingContext2D;
    toScreenCoords!: (x: number, y: number) => [number, number];

    setup(actions: ISystemActions): void | Promise<void> {
        this.ctx = actions.getResource(CanvasRenderingContext2D);
        this.toScreenCoords = relToScreenCoords.bind(undefined, this.ctx.canvas);
    }

    run(dataSet: Set<Data>) {
        this.ctx.textBaseline = 'top';

        for (const {pos, ui} of dataSet) {
            const screenPos = this.toScreenCoords(pos.x, pos.y);

            this.ctx.fillStyle = ui.active
                ? ui.activeColor ?? 'red'
                : ui.color;
            this.ctx.font = ui.active
                ? `${ui.fontSize * 1.2}px serif`
                : `${ui.fontSize}px serif`;
            this.ctx.fillText(ui.finalCaption, screenPos[0], screenPos[1]);
        }
    }
}
