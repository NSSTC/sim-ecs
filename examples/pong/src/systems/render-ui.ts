import {Position} from "../components/position";
import {ISystemActions, Query, Read, System} from "sim-ecs";
import {UIItem} from "../components/ui-item";
import {relToScreenCoords} from "../app/util";

export class RenderUISystem extends System {
    query = new Query({
        pos: Read(Position),
        ui: Read(UIItem)
    });

    ctx!: CanvasRenderingContext2D;
    toScreenCoords!: (x: number, y: number) => [number, number];

    setup(actions: ISystemActions): void | Promise<void> {
        this.ctx = actions.getResource(CanvasRenderingContext2D);
        this.toScreenCoords = relToScreenCoords.bind(undefined, this.ctx.canvas);
    }

    run(actions: ISystemActions) {
        this.ctx.textBaseline = 'top';

        this.query.execute(({pos, ui}) => {
            const screenPos = this.toScreenCoords(pos.x, pos.y);

            this.ctx.fillStyle = ui.active
                ? ui.activeColor ?? 'red'
                : ui.color;
            this.ctx.font = ui.active
                ? `${ui.fontSize * 1.2}px serif`
                : `${ui.fontSize}px serif`;
            this.ctx.fillText(ui.finalCaption, screenPos[0], screenPos[1]);
        });
    }
}
