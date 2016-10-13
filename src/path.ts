import { Metadata } from "./metadata";

export class Path {
    private _property: Metadata.NavigationProperty;
    get property(): Metadata.NavigationProperty { return this._property };

    private _next: Path;
    get next(): Path { return this._next };

    constructor(args: {
        property: Metadata.NavigationProperty;
        next?: Path;
    }) {
        this._property = args.property;
        this._next = args.next || null;
    }

    toString(): string {
        return this.next == null ? this.property.name : `${this.property.name}/${this.next.toString()}`;
    }
}
