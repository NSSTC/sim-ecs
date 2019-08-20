import IComponent from "./component.spec";

export * from './component.spec';

export class Component implements IComponent {
    private __component__ = undefined;
    toString(): string {
        return this.constructor.name + ' ' + JSON.stringify(this);
    }
}
