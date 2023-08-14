export enum EReferenceType {
    Entity = 'ENTITY',
}

export interface IReference {
    /**
     * ID of the referenced object
     */
    readonly id: string
    /**
     * Type of the referenced object
     */
    readonly type: EReferenceType

    /**
     * Convert this reference to string.
     * The string can later on be read to create a new Reference using the static method Reference.fromString()
     */
    toString(): string
}
