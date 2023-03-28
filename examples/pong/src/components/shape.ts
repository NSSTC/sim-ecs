import {Dimensions} from "../models/dimensions.ts";

export class Shape {
    constructor(
        public dimensions: Dimensions,
        public color = 'white',
    ) {}
}
