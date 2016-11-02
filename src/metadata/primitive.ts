import { Property } from "./property";

export class Primitive extends Property {
    private _index: boolean;
    get index(): boolean { return this._index; }

    constructor(args: Primitive.ICtorArgs) {
        super({ name: args.name });

        this._index = !!args.index;
    }
}

export module Primitive {
    export interface ICtorArgs {
        name: string;
        index?: boolean;
    }
}
