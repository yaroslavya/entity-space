import { Collection } from "./collection";
import { Primitive } from "./primitive";
import { Property } from "./property";
import { NavigationProperty } from "./navigation-property";
import { Reference } from "./reference";

export class EntityMetadata {
    get name(): string { return this._name; };
    private _name: string;

    get primaryKey(): Primitive { return this._primaryKey; }
    private _primaryKey: Primitive;

    get properties(): Property[] { return this._properties._toArray(); }
    private _properties: Map<string, Property>;

    get primitives(): Primitive[] { return this._primitives._toArray(); };
    private _primitives: Map<string, Primitive>;

    get navigationProperties(): NavigationProperty[] { return this._navigationProperties._toArray(); }
    private _navigationProperties: Map<string, NavigationProperty>;

    get references(): Reference[] { return this._references._toArray(); };
    private _references: Map<string, Reference>;

    get collections(): Collection[] { return this._collections._toArray(); };
    private _collections: Map<string, Collection>;

    constructor(args: EntityMetadata.ICtorArgs) {
        this._name = args.name;
        this._primaryKey = new Primitive(args.primaryKey);
        this._properties = new Map<string, Property>();
        this._primitives = new Map<string, Primitive>();
        this._references = new Map<string, Reference>();
        this._collections = new Map<string, Collection>();
        this._navigationProperties = new Map<string, NavigationProperty>();

        (args.primitives || []).forEach(a => this.addPrimitive(a));
        (args.references || []).forEach(a => this.addReference(a));
        (args.collections || []).forEach(a => this.addCollection(a));
    }

    addPrimitive(args: Primitive.ICtorArgs): void {
        let p = new Primitive(args);
        this._primitives.set(p.name.toLocaleLowerCase(), p);
        this._addProperty(p);
    }

    addReference(args: Reference.ICtorArgs): void {
        let ref = new Reference(args);
        this._references.set(ref.name.toLocaleLowerCase(), ref);
        this._addNavigationProperty(ref);
    }

    addCollection(args: Collection.ICtorArgs): void {
        let col = new Collection(args);
        this._collections.set(col.name.toLocaleLowerCase(), col);
        this._addNavigationProperty(col);
    }

    getProperty(name: string): Property {
        return this._properties.get(name.toLocaleLowerCase()) || null;
    }

    getPrimitive(name: string): Primitive {
        return this._primitives.get(name.toLocaleLowerCase()) || null;
    }

    getNavigationProperty(name: string): NavigationProperty {
        return this._navigationProperties.get(name.toLocaleLowerCase()) || null;
    }

    getReference(name: string): Reference {
        return this._references.get(name.toLocaleLowerCase()) || null;
    }

    getCollection(name: string): Collection {
        return this._collections.get(name.toLocaleLowerCase()) || null;
    }

    /**
     * Returns a new object with only the primary key, primitive properties and ids to references.
     */
    withoutNavigationProperties(entity: any): any {
        let stripped = {} as any;

        stripped[this.primaryKey.name] = entity[this.primaryKey.name];
        this._primitives.forEach(p => stripped[p.name] = entity[p.name]);
        this._references.forEach(r => stripped[r.keyName] = entity[r.keyName]);

        return stripped;
    }

    private _addProperty(p: Property): void {
        this._properties.set(p.name.toLocaleLowerCase(), p);
    }

    private _addNavigationProperty(nav: NavigationProperty): void {
        this._navigationProperties.set(nav.name.toLocaleLowerCase(), nav);
        this._addProperty(nav);
    }
}

export module EntityMetadata {
    export interface ICtorArgs {
        name: string;
        primaryKey: Primitive.ICtorArgs;
        primitives?: Primitive.ICtorArgs[];
        references?: Reference.ICtorArgs[];
        collections?: Collection.ICtorArgs[];
    }
}
