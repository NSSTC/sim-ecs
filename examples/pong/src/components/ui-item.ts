import {IUIElement} from "../models/UIElement";
import {EActions} from "../app/actions";

export class UIItem implements IUIElement {
    constructor(
        public caption: string,
        public color: string,
        public fontSize: number,
        public left: number,
        public top: number,
        public action?: EActions,
        public activeColor?: string,
    ) {}

    public draw(ctx: CanvasRenderingContext2D, active: boolean = false) {
        ctx.fillStyle = active
            ? this.activeColor ?? 'red'
            : this.color;
        ctx.font = active
            ? `${this.fontSize * 1.2}px serif`
            : `${this.fontSize}px serif`;
        ctx.fillText(this.caption, this.left, this.top);
    }
}