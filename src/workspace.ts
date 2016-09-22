import * as _ from "lodash";
import { ITypeOf } from "./common";
import { Cache } from "./cache";
import { Metadata } from "./metadata";
import { Expansion } from "./expansion";
import { Query } from "./query";

export class Workspace {
    private _metadata = new Map<string, Metadata>();
    private _caches = new Map<string, Cache<any, any>>();

    addType(metadata: Metadata): void {
        if (this._metadata.has(metadata.name)) {
            throw `i already have metadata named ${metadata.name}`;
        }

        let indexes: { [key: string]: (item: any) => any } = {};

        metadata.primitives.filter(p => p.index).forEach(p => indexes[p.name] = item => item[p.name]);
        metadata.references.forEach(r => indexes[r.keyName] = (item: any) => item[r.keyName]);

        let cache = new Cache<any, any>({
            getter: item => item[metadata.primaryKey.name],
            indexes
        });

        this._caches.set(metadata.name, cache);
        this._metadata.set(metadata.name, metadata);
    }

    execute(q: Query): Promise<Map<any, any>> {
        let result: Map<any, any> = new Map();

        if (q instanceof Query.All) {
            result = this.all({
                type: q.entityType.name,
                expansion: q.expansions
            });
        } else if (q instanceof Query.ByKey) {
            let item = this.get({
                key: q.key,
                type: q.entityType.name,
                expansion: q.expansions
            });

            result.set(q.key, item);
        } else if (q instanceof Query.ByKeys) {
            result = this.getMany({
                keys: q.keys,
                type: q.entityType.name,
                expansion: q.expansions
            });
        } else if (q instanceof Query.ByIndex) {
            result = this.byIndex({
                index: q.index,
                value: q.value,
                type: q.entityType.name,
                expansion: q.expansions
            });
        }

        return Promise.resolve(result)
    }

    add(args: {
        entity: Object;
        type: string;
        expansion?: string | Expansion[];
    }): void {
        let metadata = this._metadata.get(args.type);
        let cache = this._caches.get(args.type);
        let expansions = new Array<Expansion>();

        if (args.expansion != null) {
            if (args.expansion instanceof Array) {
                expansions = args.expansion as Expansion[];
            } else {
                expansions = Expansion.parse(metadata, args.expansion as string);
            }
        }

        let stripped = this._stripNavigationProperties(args.type, args.entity);
        cache.add(stripped);

        expansions.forEach(ex => {
            let value = args.entity[ex.property.name];
            let otherType = ex.property.otherType;

            if (value instanceof Array && (value as []).length > 0) {
                let keyName = (ex.property as Metadata.Collection).backReferenceKeyName;
                let otherCache = this._caches.get(otherType.name);
                otherCache.removeByIndex(keyName, value[0][keyName]);

                (value as any[]).forEach(v => {
                    this.add({ entity: v, type: otherType.name, expansion: ex.expansions });
                });
            } else {
                this.add({ entity: value, type: otherType.name, expansion: ex.expansions });
            }
        });
    }

    get<T>(args: {
        key: any;
        type: string;
        expansion?: string | Expansion[];
    }): any {
        let item = this._caches.get(args.type).get(args.key);
        if (item == null) return null;
        item = _.cloneDeep(item);

        let metadata = this._metadata.get(args.type);
        let expansions = new Array<Expansion>();

        if (args.expansion != null) {
            if (args.expansion instanceof Array) {
                expansions = args.expansion as Expansion[];
            } else {
                expansions = Expansion.parse(metadata, args.expansion as string);
            }
        }

        let map = new Map();
        map.set(item[metadata.primaryKey.name], item);

        this._expand({
            items: map,
            ownerMetadata: metadata,
            expansions: expansions
        });

        return item;
    }

    getMany<T>(args: {
        keys: any[];
        type: string;
        expansion?: string | Expansion[];
    }): Map<any, any> {
        let items = this._caches.get(args.type).getMany(args.keys)._map(i => _.cloneDeep(i));
        if (items.size == 0) return items;

        let metadata = this._metadata.get(args.type);
        let expansions = new Array<Expansion>();

        if (args.expansion != null) {
            if (args.expansion instanceof Array) {
                expansions = args.expansion as Expansion[];
            } else {
                expansions = Expansion.parse(metadata, args.expansion as string);
            }
        }

        this._expand({
            items: items,
            ownerMetadata: metadata,
            expansions: expansions
        });

        return items;
    }

    all<T>(args: {
        type: string;
        expansion?: string | Expansion[];
    }): Map<any, any> {
        let items = this._caches.get(args.type).all()._map(i => _.cloneDeep(i));
        if (items.size == 0) return items;

        let metadata = this._metadata.get(args.type);
        let expansions = new Array<Expansion>();

        if (args.expansion != null) {
            if (args.expansion instanceof Array) {
                expansions = args.expansion as Expansion[];
            } else {
                expansions = Expansion.parse(metadata, args.expansion as string);
            }
        }

        this._expand({
            items: items,
            ownerMetadata: metadata,
            expansions: expansions
        });

        return items;
    }

    byIndex<T>(args: {
        index: string;
        value: any;
        type: string;
        expansion?: string | Expansion[];
    }): Map<any, any> {
        let items = this._caches.get(args.type).byIndex(args.index, args.value)._map(i => _.cloneDeep(i));
        if (items.size == 0) return items;

        let metadata = this._metadata.get(args.type);
        let expansions = new Array<Expansion>();

        if (args.expansion != null) {
            if (args.expansion instanceof Array) {
                expansions = args.expansion as Expansion[];
            } else {
                expansions = Expansion.parse(metadata, args.expansion as string);
            }
        }

        this._expand({
            items: items,
            ownerMetadata: metadata,
            expansions: expansions
        });

        return items;
    }

    /**
     * The code of this function was once duplicated @ get(), all() and ofIndex() functions.
     * Interestingly enough it was faster that way by about 15% (@ Chrome).
     */
    private _expand(args: {
        items: Map<any, any>;
        expansions: Expansion[];
        ownerMetadata: Metadata;
    }): void {
        args.expansions.forEach(expansion => {
            let name = expansion.property.name;
            let otherType = expansion.property.otherType;

            if (expansion.property instanceof Metadata.Reference) {
                let reference = expansion.property as Metadata.Reference;
                let keyName = reference.keyName;

                args.items.forEach(item => item[name] = this.get({
                    key: item[keyName],
                    type: otherType.name,
                    expansion: expansion.expansions
                }));
            } else {
                let collection = expansion.property as Metadata.Collection;
                let keyName = collection.otherType.references.find(r => r.name == collection.backReferenceName).keyName;
                let pkName = args.ownerMetadata.primaryKey.name;

                args.items.forEach(item => item[name] = this.byIndex({
                    index: keyName,
                    value: item[pkName],
                    type: otherType.name,
                    expansion: expansion.expansions
                }));
            }
        });
    }

    private _stripNavigationProperties(type: string, entity: Object): Object {
        let stripped = {} as any;
        let metadata = this._metadata.get(type);

        stripped[metadata.primaryKey.name] = entity[metadata.primaryKey.name];
        metadata.primitives.forEach(p => stripped[p.name] = entity[p.name]);
        metadata.references.forEach(r => stripped[r.keyName] = entity[r.keyName]);

        return stripped;
    }
}
