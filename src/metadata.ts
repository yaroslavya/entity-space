export class Metadata {
    private _name: string;
    get name(): string { return this._name };

    private _primaryKey: Metadata.Primitive;
    get primaryKey(): Metadata.Primitive { return this._primaryKey; }

    private _primitives: Metadata.Primitive[];
    get primitives(): Metadata.Primitive[] { return this._primitives };

    private _navigationProperties: Metadata.NavigationProperty[];
    get navigationProperties(): Metadata.NavigationProperty[] { return this._navigationProperties; }

    private _references: Metadata.Reference[];
    get references(): Metadata.Reference[] { return this._references };

    private _collections: Metadata.Collection[];
    get collections(): Metadata.Collection[] { return this._collections };

    constructor(args: {
        name: string;
        primaryKey: Metadata.Primitive.ICtorArgs;
        primitives?: Metadata.Primitive.ICtorArgs[];
    }) {
        this._name = args.name;
        this._primaryKey = new Metadata.Primitive(args.primaryKey);
        this._primitives = (args.primitives || []).map(a => new Metadata.Primitive(a));
        this._references = [];
        this._collections = [];
        this._navigationProperties = [];
    }

    addPrimitive(args: Metadata.Primitive.ICtorArgs): void {
        let p = new Metadata.Primitive(args);
        this._primitives.push(p);
    }

    addReference(args: Metadata.Reference.ICtorArgs): void {
        let ref = new Metadata.Reference(args);
        this._references.push(ref);
        this._addNavigationProperty(ref);
    }

    addCollection(args: Metadata.Collection.ICtorArgs): void {
        let col = new Metadata.Collection(args);
        this._collections.push(col);
        this._addNavigationProperty(col);
    }

    private _addNavigationProperty(nav: Metadata.NavigationProperty): void {
        this._navigationProperties.push(nav);
    }
}

export module Metadata {
    export class Property {
        private _name: string;
        get name(): string { return this._name; }

        constructor(args: {
            name: string;
        }) {
            this._name = args.name;
        }
    }

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

    export class NavigationProperty extends Property {
        private _otherType: Metadata;
        get otherType(): Metadata { return this._otherType };

        constructor(args: {
            name: string;
            otherType: Metadata;
        }) {
            super({ name: args.name });

            this._otherType = args.otherType;
        }
    }

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
            otherType: Metadata;
        }
    }

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
            otherType: Metadata;
        }
    }
}
