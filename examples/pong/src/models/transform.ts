import {Position} from "../components/position";
import {Dimensions} from "./dimensions";

export class Transform {
    constructor(
        public position: Position,
        public dimensions: Dimensions,
    ) {}
}
