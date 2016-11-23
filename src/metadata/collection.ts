import { IEntityType } from "./entity-decorator";
import { NavigationProperty } from "./navigation-property";

export class Collection extends NavigationProperty {
    private _backReferenceKeyName: string;
    get backReferenceKeyName(): string { return this._backReferenceKeyName };

    private _backReferenceName: string;
    get backReferenceName(): string { return this._backReferenceName };

    constructor(args: Collection.ICtorArgs) {
        super({
            name: args.name,
            otherType: args.otherType
        });

        this._backReferenceKeyName = args.backReferenceKeyName;
        this._backReferenceName = args.backReferenceName;
    }
}

export module Collection {
    export interface ICtorArgs {
        backReferenceKeyName: string;
        backReferenceName: string;
        name: string;
        otherType: () => IEntityType;
    }
}
