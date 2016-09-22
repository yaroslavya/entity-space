import { Metadata } from "./metadata";

/**
 * An expansion defines which navigation properties should be considered for an operation.
 * 
 * It contains the navigation property that is expanded upon and an array of expansions
 * that navigation property should be expanded upon further.
 * 
 * If an expansion has been created using Expansion.parse(), it is secured that the resulting
 * navigation tree is valid (as according to the given entity metadata).
 */
export class Expansion {
    /**
     * The navigation property that is expanded.
     */
    get property(): Metadata.NavigationProperty { return this._property; }
    private _property: Metadata.NavigationProperty;

    /**
     * Expansions of the navigation property.
     */
    get expansions(): Expansion[] { return this._expansions; }
    private _expansions: Expansion[];

    constructor(args: {
        property: Metadata.NavigationProperty;
        expansions?: Expansion[];
    }) {
        this._property = args.property;
        this._expansions = (args.expansions || []).slice().sort((a, b) => a.property.name < b.property.name ? -1 : 1);
    }

    static equals(a: Expansion, b: Expansion): boolean {
        return a.toString() == b.toString();
    }

    /**
     * Determines if x is a superset of y, securing that an operation on x
     * leads to a superset of y when using the same operation on y.
     */
    static isSuperset(x: Expansion, y: Expansion): boolean;
    static isSuperset(x: Expansion[], y: Expansion[]): boolean;
    static isSuperset(...args: any[]): boolean {
        let x = args[0] as Expansion | Expansion[];
        let y = args[1] as Expansion | Expansion[];

        if (x instanceof Array && y instanceof Array) {
            if (x.length < y.length) return false;

            x.sort((x, y) => x.property.name < y.property.name ? -1 : 1);

            let e = 0;

            for (let i = 0; i < x.length; ++i) {
                let [aExp, bExp] = [x[i], y[e]];

                if (bExp == null) break;
                if (aExp.property != bExp.property) continue;
                if (!Expansion.isSuperset(aExp, bExp)) return false;

                e++;
            }

            return true;
        } else if (x instanceof Expansion && y instanceof Expansion) {
            if (x.property != y.property) return false;
            if (x.expansions.length < y.expansions.length) return false;

            return Expansion.isSuperset(x.expansions, y.expansions);
        } else {
            throw new Error("Expansion.isSuperSetOf(): invalid arguments");
        }
    }

    isSupersetOf(other: Expansion): boolean {
        return Expansion.isSuperset(this, other);
    }

    isSubsetOf(other: Expansion): boolean {
        return Expansion.isSuperset(other, this);
    }

    equals(other: Expansion): boolean {
        return Expansion.equals(this, other);
    }

    /**
     * Extract all expansions (and any sub-expansions) that use any of the given
     * navigation properties. Those expansions are removed from the tree.
     */
    extract(props: Metadata.NavigationProperty[]): Expansion.Extraction[] {
        let extractions = new Array<Expansion.Extraction>();

        let i = this._expansions.length;

        while (i--) {
            let exp = this._expansions[i];

            if (props.includes(exp.property)) {
                extractions.push(new Expansion.Extraction({
                    path: new Expansion.Path({ property: this.property }),
                    extracted: exp
                }));

                this._expansions.splice(i, 1);
            } else {
                exp.extract(props).forEach(extracted => {
                    extractions.push(new Expansion.Extraction({
                        path: new Expansion.Path({
                            property: this.property,
                            next: extracted.path
                        }),
                        extracted: extracted.extracted
                    }));
                });
            }
        }

        return extractions;
    }

    toPaths(): Expansion.Path[] {
        if (this.expansions.length == 0) {
            return [new Expansion.Path({ property: this.property })];
        }

        let paths = new Array<Expansion.Path>();
        this.expansions.forEach(exp => exp.toPaths().forEach(p => paths.push(new Expansion.Path({ property: this.property, next: p }))));

        return paths;
    }

    toString(): string {
        let str = this.property.name;

        if (this.expansions.length > 0) {
            str += "/";

            if (this.expansions.length > 1) str += "{";
            str += this.expansions.map(exp => exp.toString()).join(",");
            if (this.expansions.length > 1) str += "}";
        }

        return str;
    }
}

export module Expansion {
    /**
     * Create expansions starting at the given entity type, crawling down
     * navigation properties as defined in the given expansion string.
     * 
     * Example: Expansion.parse(artistMetadata, "albums/{songs, tags}")
     */
    export function parse(ownerType: Metadata, expansion: string): Expansion[] {
        expansion = expansion.replace(/(\r?\n|\r)| /g, "");

        return _splitExpansions(expansion).map(e => _parse(ownerType, e));
    }

    function _parse(ownerType: Metadata, expansion: string): Expansion {
        let slashIndex = expansion.indexOf("/");
        let name = slashIndex == -1 ? expansion : expansion.substring(0, slashIndex);
        let property = ownerType.navigationProperties.find(p => p.name == name);

        if (property == null) throw `unknown navigation property: ${name}`;

        if (name.length == expansion.length) {
            return new Expansion({ property: property });
        }

        let hasGroupedExpansions = expansion[slashIndex + 1] == "{";

        if (!hasGroupedExpansions) {
            return new Expansion({
                property: property,
                expansions: [_parse(property.otherType, expansion.substr(slashIndex + 1))]
            });
        } else {
            let endsProperly = expansion[expansion.length - 1] == "}";
            if (!endsProperly) throw "no closing brace in expansion";

            return new Expansion({
                property: property,
                expansions: _splitExpansions(expansion.substring(slashIndex + 2, expansion.length - 1)).map(e => _parse(property.otherType, e))
            });
        }
    }

    function _splitExpansions(str: string): string[] {
        let cutpoints = new Array<number>();
        let i = 0;
        let openBraces = 0;

        while (i < str.length) {
            let c = str[i];

            if (openBraces == 0 && c == ",") {
                cutpoints.push(i);
            } else if (c == "{") {
                openBraces++;
            } else if (c == "}") {
                openBraces--;
            }

            i++;
        }

        if (cutpoints.length == 0) return [str];

        let offset = 0;

        return cutpoints.concat([str.length]).map(c => {
            let e = str.substring(offset, c);
            offset = c + 1;
            return e;
        });
    }

    export class Extraction {
        private _path: Path;
        get path(): Path { return this._path };

        private _extracted: Expansion;
        get extracted(): Expansion { return this._extracted };

        constructor(args: {
            path: Path;
            extracted: Expansion;
        }) {
            this._path = args.path;
            this._extracted = args.extracted;
        }
    }

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
}
