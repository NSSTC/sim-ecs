import {Position} from "../components/position.ts";
import {Dimensions} from "./dimensions.ts";

export class Transform {
    constructor(
        public position: Position,
        public dimensions: Dimensions,
    ) {}
}
