export class Property {
    private _name: string;
    get name(): string { return this._name; }

    constructor(args: {
        name: string;
    }) {
        this._name = args.name;
    }
}
