import type {ISerialFormat} from "./serial-format.spec.ts";
import type {TEntity} from "./_.ts";

export * from "./serial-format.spec.ts";

export class SerialFormat extends Array<TEntity> implements ISerialFormat {
    static fromArray(arr: ReadonlyArray<TEntity>): SerialFormat {
        return new SerialFormat().fromArray(arr);
    }

    static fromJSON(json: string): SerialFormat {
        return new SerialFormat().fromJSON(json);
    }

    fromArray(arr: ReadonlyArray<TEntity>): SerialFormat {
        Object.assign(this, arr);
        return this;
    }

    fromJSON(json: string): SerialFormat {
        this.length = 0;

        const newVals: Readonly<object> = JSON.parse(json);

        if (!Array.isArray(newVals)) {
            throw new Error('Input JSON must be an array!');
        }

        for (const entity of newVals) {
            this.push(entity);
        }

        return this;
    }

    toJSON(indentation?: string | number): string {
        return JSON.stringify(Array.from(this), undefined, indentation);
    }
}
