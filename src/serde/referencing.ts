import {EReferenceType} from "./referencing.spec";
import {CMarkerSeparator, CRefMarker} from "./serde.spec";

export class Reference {
    constructor(
        public readonly type: EReferenceType,
        public readonly id: string,
    ) {}

    static fromString(refString: string): Reference | undefined {
        const [marker, type, ...idTokens] = refString.split(CMarkerSeparator);

        if (marker != CRefMarker) {
            return undefined;
        }

        if (!(Object.values(EReferenceType) as string[]).includes(type)) {
            return undefined;
        }

        return new Reference(type as EReferenceType, idTokens.join());
    }

    static isReferenceString (str: string) {
        const [marker, type] = str.split(CMarkerSeparator);
        return marker === CRefMarker && (Object.values(EReferenceType) as string[]).includes(type);
    }

    toString() {
        return `${CRefMarker}${CMarkerSeparator}${this.type}${CMarkerSeparator}${this.id}`;
    }
}
