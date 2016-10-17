import { Metadata } from "./metadata";
import { Path } from "./path";
import { Extraction } from "./extraction";

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
    private _toStringValue: string;

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

        /**
         * we're only going to free the expansions, so that string representations
         * can still be lazily evaluated.
         */
        Object.freeze(this._expansions);
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
            // x can not be a superset if y contains more expansions
            if (x.length < y.length) return false;

            // prepare the arrays for comparison
            x.sort((a, b) => a.property.name < b.property.name ? -1 : 1);

            let e = 0;

            for (let i = 0; i < x.length; ++i) {
                let [xExp, yExp] = [x[i], y[e]];

                // if we reached end the end of y, x must be a superset
                if (yExp == null) break;
                // property of x does not exist in y, x is still a superset - advance x
                if (xExp.property != yExp.property) continue;
                // properties of x and y match - deepen recursion
                if (!Expansion.isSuperset(xExp, yExp)) return false;

                e++;
            }

            return true;
        } else if (x instanceof Expansion && y instanceof Expansion) {
            // x can't be a superset if y points to a different property
            if (x.property != y.property) return false;
            // x can't be a superset if y has more expansions
            if (x.expansions.length < y.expansions.length) return false;

            // x and y match in property and expansion length - deepen recursion
            return Expansion.isSuperset(x.expansions, y.expansions);
        } else {
            throw new Error("Expansion.isSuperSetOf(): invalid arguments");
        }
    }

    static toString(exp: Expansion): string {
        let str = exp.property.name;

        if (exp.expansions.length > 0) {
            str += "/";

            if (exp.expansions.length > 1) str += "{";
            str += exp.expansions.map(exp => exp.toString()).join(",");
            if (exp.expansions.length > 1) str += "}";
        }

        return str;
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
     * navigation properties.
     * 
     * Returns the reduced expansion and the extractions.
     */
    extract(props: Metadata.NavigationProperty[]): [Expansion, Extraction[]] {
        let extractions = new Array<Extraction>();
        let expansions = new Array<Expansion>();

        this._expansions.forEach(exp => {
            if (props.includes(exp.property)) {
                extractions.push(new Extraction({
                    path: new Path({ property: this.property }),
                    extracted: exp
                }));
            } else {
                let [subExpansion, subExtracted] = exp.extract(props);

                expansions.push(subExpansion);

                subExtracted.forEach(ext => {
                    extractions.push(new Extraction({
                        path: new Path({
                            property: this.property,
                            next: ext.path
                        }),
                        extracted: ext.extracted
                    }));
                });
            }
        });

        return [new Expansion({
            property: this.property,
            expansions: expansions
        }), extractions];
    }

    toPaths(): Path[] {
        if (this.expansions.length == 0) {
            return [new Path({ property: this.property })];
        }

        let paths = new Array<Path>();
        this.expansions.forEach(exp => exp.toPaths().forEach(p => paths.push(new Path({ property: this.property, next: p }))));

        return paths;
    }

    toString(): string {
        if (this._toStringValue == null) {
            this._toStringValue = Expansion.toString(this);
        }

        return this._toStringValue;
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
}
