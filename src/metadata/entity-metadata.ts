import { Collection } from "./collection";
import { Primitive } from "./primitive";
import { NavigationProperty } from "./navigation-property";
import { Reference } from "./reference";

export class EntityMetadata {
    private _name: string;
    get name(): string { return this._name };

    private _primaryKey: Primitive;
    get primaryKey(): Primitive { return this._primaryKey; }

    private _primitives: Primitive[];
    get primitives(): Primitive[] { return this._primitives };

    private _navigationProperties: NavigationProperty[];
    get navigationProperties(): NavigationProperty[] { return this._navigationProperties; }

    private _references: Reference[];
    get references(): Reference[] { return this._references };

    private _collections: Collection[];
    get collections(): Collection[] { return this._collections };

    constructor(args: {
        name: string;
        primaryKey: Primitive.ICtorArgs;
        primitives?: Primitive.ICtorArgs[];
    }) {
        this._name = args.name;
        this._primaryKey = new Primitive(args.primaryKey);
        this._primitives = (args.primitives || []).map(a => new Primitive(a));
        this._references = [];
        this._collections = [];
        this._navigationProperties = [];
    }

    addPrimitive(args: Primitive.ICtorArgs): void {
        let p = new Primitive(args);
        this._primitives.push(p);
    }

    addReference(args: Reference.ICtorArgs): void {
        let ref = new Reference(args);
        this._references.push(ref);
        this._addNavigationProperty(ref);
    }

    addCollection(args: Collection.ICtorArgs): void {
        let col = new Collection(args);
        this._collections.push(col);
        this._addNavigationProperty(col);
    }

    private _addNavigationProperty(nav: NavigationProperty): void {
        this._navigationProperties.push(nav);
    }
}
