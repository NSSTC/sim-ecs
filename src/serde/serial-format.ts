import {ISerialFormat} from "./serial-format.spec";
import {TEntity} from "./_";

export * from "./serial-format.spec";

export class SerialFormat extends Array<TEntity> implements ISerialFormat {
    static fromArray(arr: TEntity[]): SerialFormat {
        return new SerialFormat().fromArray(arr);
    }

    static fromJSON(json: string): SerialFormat {
        return new SerialFormat().fromJSON(json);
    }

    fromArray(arr: TEntity[]): SerialFormat {
        Object.assign(this, arr);
        return this;
    }

    fromJSON(json: string): SerialFormat {
        this.length = 0;

        const newVals = JSON.parse(json);

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
