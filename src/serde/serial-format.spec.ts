import type {TEntity} from "./_.ts";

export interface ISerialFormat extends Array<TEntity> {
    /**
     * IMPORTANT: This method also exists as a static member.
     * Tracking for static members in TS: https://github.com/microsoft/TypeScript/issues/33892
     * Copy an external array
     * @param arr
     */
    fromArray(arr: ReadonlyArray<TEntity>): ISerialFormat

    /**
     * IMPORTANT: This method also exists as a static member.
     * Tracking for static members in TS: https://github.com/microsoft/TypeScript/issues/33892
     * Read a JSON string into this structure
     * @param json
     */
    fromJSON(json: string): ISerialFormat

    /**
     * Transform into JSON string
     * @param indentation - optional indentation, useful for human readability
     */
    toJSON(indentation?: string | number): string
}
