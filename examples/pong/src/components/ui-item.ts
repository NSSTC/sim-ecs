import {EActions} from "../app/actions";

export class UIItem {
    public captionMod = (strIn: string) => strIn;

    constructor(
        public caption: string,
        public color: string,
        public fontSize: number,
        public action?: EActions,
        public active?: boolean,
        public activeColor?: string,
    ) {}

    get finalCaption(): string {
        return this.captionMod(this.caption);
    }
}