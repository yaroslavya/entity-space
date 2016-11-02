import { EntityMetadata } from "./entity-metadata";
import { NavigationProperty } from "./navigation-property";

export class Reference extends NavigationProperty {
    private _keyName: string;
    get keyName(): string { return this._keyName };

    constructor(args: Reference.ICtorArgs) {
        super({
            name: args.name,
            otherType: args.otherType
        });

        this._keyName = args.keyName;
    }
}

export module Reference {
    export interface ICtorArgs {
        keyName: string;
        name: string;
        otherType: EntityMetadata;
    }
}
