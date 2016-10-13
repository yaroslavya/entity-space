import * as _ from "lodash";
import { Metadata } from "./metadata";
import { Expansion } from "./expansion";

export abstract class Query {
    private _entityType: Metadata;
    get entityType(): Metadata { return this._entityType; }

    private _expansions: Expansion[];
    get expansions(): Expansion[] { return this._expansions; }

    constructor(args: {
        entityType: Metadata;
        expansions?: Expansion[];
    }) {
        this._entityType = args.entityType;
        this._expansions = (args.expansions || []).slice().sort((a, b) => a.property.name < b.property.name ? -1 : 1);

        Object.freeze(this._expansions);
    }

    static equals(a: Query, b: Query): boolean {
        return a.toString() == b.toString();
    }

    abstract isSuperSetOf(other: Query): boolean;

    isSubsetOf(other: Query): boolean {
        return other.isSuperSetOf(this);
    }

    equals(other: Query): boolean {
        return Query.equals(this, other);
    }

    extract(props: Metadata.NavigationProperty[]): [Query, Expansion.Extraction[]] {
        let extractions = new Array<Expansion.Extraction>();
        let expansions = new Array<Expansion>();

        this._expansions.forEach(exp => {
            if (props.includes(exp.property)) {
                extractions.push(new Expansion.Extraction({
                    extracted: exp
                }));
            } else {
                let [subExp, subExtractions] = exp.extract(props);

                expansions.push(subExp);
                extractions = extractions.concat(subExtractions);
            }
        });


        let q: Query;

        if (this instanceof Query.ByKey) {
            q = new Query.ByKey({ key: this.key, entityType: this.entityType, expansions: expansions });
        } else if (this instanceof Query.ByKeys) {
            q = new Query.ByKeys({ keys: this.keys, entityType: this.entityType, expansions: expansions });
        } else if (this instanceof Query.ByIndex) {
            q = new Query.ByIndex({ index: this.index, value: this.value, entityType: this.entityType, expansions: expansions });
        } else if (this instanceof Query.ByIndexes) {
            q = new Query.ByIndexes({ indexes: this.indexes, entityType: this.entityType, expansions: expansions });
        } else if (this instanceof Query.All) {
            q = new Query.All({ entityType: this.entityType, expansions: expansions });
        }

        return [q, extractions];
    }

    toString(): string {
        return this._toString();
    }

    protected _toString(args?: {
        suffix?: any;
    }): string {
        args = args || {} as any;

        let str = this.entityType.name;

        if (args.suffix != null) {
            str += `(${args.suffix})`;
        }

        if (this.expansions.length > 0) {
            str += "/";

            if (this.expansions.length > 1) str += "{";
            str += this.expansions.map(exp => exp.toString()).join(",");
            if (this.expansions.length > 1) str += "}";
        }

        return str;
    }
}

export module Query {
    export class All extends Query {
        isSuperSetOf(other: Query): boolean {
            if (other.entityType != this.entityType) return false;

            return Expansion.isSuperset(this.expansions, other.expansions);
        }
    }

    export class ByKey extends Query {
        private _key: any;
        get key(): any { return this._key; }

        constructor(args: {
            key: any;
            entityType: Metadata;
            expansions?: Expansion[];
        }) {
            super(args);

            this._key = args.key;
        }

        isSuperSetOf(other: Query): boolean {
            if (other.entityType != this.entityType) return false;
            if (other instanceof ByKey && other.key == this.key) {
                return Expansion.isSuperset(this.expansions, other.expansions)
            }

            return false;
        }

        toString(): string {
            return this._toString({
                suffix: this.key
            });
        }
    }

    export class ByKeys extends Query {
        private _keys: any[];
        get keys(): any[] { return this._keys; }

        constructor(args: {
            keys: any[];
            entityType: Metadata;
            expansions?: Expansion[];
        }) {
            super(args);

            this._keys = args.keys.slice();
        }

        isSuperSetOf(other: Query): boolean {
            if (other.entityType != this.entityType) return false;
            if (other instanceof ByKey && this._keys.includes(other.key)) {
                return Expansion.isSuperset(this.expansions, other.expansions);
            } else if (other instanceof ByKeys && _.isEqual(this._keys.sort(), other._keys.sort())) {
                return Expansion.isSuperset(this.expansions, other.expansions);
            }

            return false;
        }

        toString(): string {
            return this._toString({
                suffix: this.keys.join(",")
            });
        }
    }

    export class ByIndex extends Query {
        private _index: string;
        get index(): string { return this._index; }

        private _value: any;
        get value(): any { return this._value; }

        constructor(args: {
            index: string;
            value: any;
            entityType: Metadata;
            expansions?: Expansion[];
        }) {
            super(args);

            this._index = args.index;
            this._value = args.value;
        }

        isSuperSetOf(other: Query): boolean {
            if (other.entityType != this.entityType) return false;
            if (other instanceof ByIndex && other.index == this.index && other.value == this.value) {
                return Expansion.isSuperset(this.expansions, other.expansions)
            }

            return false;
        }

        toString(): string {
            return this._toString({
                suffix: `${this.index}:${this.value}`
            });
        }
    }

    export interface IStringable {
        toString(): string;
    }

    export class ByIndexes extends Query {
        private _indexes = new Map<string, IStringable>();
        get indexes(): Map<string, IStringable> { return this._indexes; }

        constructor(args: {
            indexes: Map<string, IStringable> | { [key: string]: IStringable };
            entityType: Metadata;
            expansions?: Expansion[];
        }) {
            super(args);

            let indexes: Map<string, IStringable>;

            if (args.indexes instanceof Map) {
                indexes = args.indexes._copy();
            } else {
                indexes = new Map<string, IStringable>();

                for (let k in args.indexes) {
                    indexes.set(k, args.indexes[k]);
                }
            }

            if (indexes.size == 0) {
                throw `a ByIndexes query can't have zero index/values pairs`;
            }

            this._indexes = indexes._copy();
        }

        isSuperSetOf(other: Query): boolean {
            if (other.entityType != this.entityType) return false;
            if (other instanceof ByIndex && this.indexes.has(other.index) && this.indexes.get(other.index) == other.value) {
                return Expansion.isSuperset(this.expansions, other.expansions)
            }
            if (other instanceof ByIndexes) {
                let otherDiffers = false;

                other.indexes.forEach((v, i) => {
                    if (!this.indexes.has(i) || this.indexes.get(i) != v) {
                        otherDiffers = true;
                    }
                });
            }

            return false;
        }

        toString(): string {
            let indexValues = new Array<string>();
            this.indexes.forEach((v, i) => indexValues.push(`${i}:${v}`));
            indexValues.sort();

            return this._toString({
                suffix: indexValues.join(",")
            });
        }
    }
}
