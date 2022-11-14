import {EActions} from "../app/actions";

export class UIItem {
    public captionMod?: (str: string) => string | undefined;

    constructor(
        public caption: string,
        public color: string,
        public fontSize: number,
        public action?: EActions,
        public active?: boolean,
        public activeColor?: string,
    ) {}
}
