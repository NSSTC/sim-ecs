import {UIItem} from "./ui-item";
import {EPaddleSide} from "./paddle";

export class GameItem extends UIItem {
    public score = 0

    constructor(
        public caption: string,
        public color: string,
        public fontSize: number,
        public left: number,
        public top: number,
        public side: EPaddleSide,
    ) {
        super(caption, color, fontSize, left, top);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.font = `${this.fontSize}px serif`;
        ctx.fillText(this.caption + ' ' + this.score, this.left, this.top);
    }
}
