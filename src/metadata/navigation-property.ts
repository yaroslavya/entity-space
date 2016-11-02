import { EntityMetadata } from "./entity-metadata";
import { Property } from "./property";

export class NavigationProperty extends Property {
    private _otherType: EntityMetadata;
    get otherType(): EntityMetadata { return this._otherType };

    constructor(args: {
        name: string;
        otherType: EntityMetadata;
    }) {
        super({ name: args.name });

        this._otherType = args.otherType;
    }
}
