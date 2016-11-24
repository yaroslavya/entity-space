import { Workspace } from "./workspace";
import { Expansion } from "./expansion";
import { getEntityMetadata, IEntityType } from "./metadata";
import { Query } from "./query";

/**
 * A helper class for a common repository. Not very well documented (yet).
 * K = primitive type of id
 * V = actual type stored
 * M = type exposed to consumer
 */
export class Repository<K, V, M> {
    get workspace(): Workspace { return this._workspace; }
    private _workspace: Workspace;

    get entityType(): IEntityType { return this._entityType; }
    private _entityType: IEntityType;

    private _executedQueries = new Map<string, Query>();

    constructor(args: {
        entityType: IEntityType;
        workspace: Workspace;
    }) {
        this._entityType = args.entityType;
        this._workspace = args.workspace;
    }

    all(args?: {
        expansion?: string;
    }): Promise<Map<K, M>> {
        args = args || {};

        return this.execute(new Query.All({
            entityType: this.entityType,
            expansions: args.expansion != null ? Expansion.parse(this.entityType, args.expansion) : []
        }));
    }

    get(args: {
        key: K;
        expansion?: string;
    }): Promise<M> {
        return this.execute(new Query.ByKey({
            entityType: this.entityType,
            expansions: args.expansion != null ? Expansion.parse(this.entityType, args.expansion) : [],
            key: args.key
        })).then(result => result.get(args.key));
    }

    getMany(args: {
        keys: K[];
        expansion?: string;
    }): Promise<Map<K, M>> {
        return this.execute(new Query.ByKeys({
            entityType: this.entityType,
            expansions: args.expansion != null ? Expansion.parse(this.entityType, args.expansion) : [],
            keys: args.keys
        }));
    }

    where(args: {
        filters: { [property: string]: { toString(): string } };
        expansion?: string;
    }): Promise<Map<K, M>> {
        let indexes = new Map<string, any>();

        for (let property in args.filters) {
            // todo: check if those indexes actually exist
            indexes.set(property, args.filters[property]);
        }

        if (indexes.size == 0) {
            return this.all({ expansion: args.expansion });
        } else if (indexes.size == 1) {
            return this.execute(new Query.ByIndex({
                entityType: this.entityType,
                expansions: args.expansion != null ? Expansion.parse(this.entityType, args.expansion) : [],
                index: indexes.keys().next().value,
                value: indexes.values().next().value
            }));
        } else {
            return this.execute(new Query.ByIndexes({
                entityType: this.entityType,
                expansions: args.expansion != null ? Expansion.parse(this.entityType, args.expansion) : [],
                indexes: indexes
            }));
        }
    }

    /**
     * To be implemented by child class.
     */
    protected loadAll(q: Query.All): Promise<V[]> {
        throw `loading all entities of ${this.entityType.name} is not supported`;
    }

    /**
     * To be implemented by child class.
     */
    protected loadOne(q: Query.ByKey): Promise<V> {
        throw `loading one entity of ${this.entityType.name} by its primary key is not supported`;
    }

    /**
     * To be implemented by child class.
     */
    protected loadMany(q: Query.ByKeys): Promise<V[]> {
        throw `loading multiple entities of ${this.entityType.name} by their primary keys is not supported`;
    }

    /**
     * To be implemented by child class.
     */
    protected loadByIndex(q: Query.ByIndex): Promise<V[]> {
        throw `loading multiple entities of ${this.entityType.name} by their index '${q.index}' is not supported`;
    }

    /**
     * To be implemented by child class.
     */
    protected loadByIndexes(q: Query.ByIndexes): Promise<V[]> {
        throw `loading multiple entities of ${this.entityType.name} by multiple indexes is not supported`;
    }

    /**
     * To be implemented by child class.
     */
    protected toExposed(internal: V): M {
        return internal as any;
    }

    /**
     * To be implemented by child class.
     */
    protected toInternal(exposed: M): V {
        return exposed as any;
    }

    /**
     * Execute a query which is first checked against cache availability.
     * If its or a superset has been executed already, cached data is returned.
     * Otherwise, data is loaded from the service (or whatever the inheritor implemented),
     * which is then added and returned. 
     */
    protected execute(query: Query): Promise<Map<K, M>> {
        return new Promise<Map<K, V>>((resolve, reject) => {
            if (this._executedQueries.has(query.toString()) || this._hasSupersetQueryOf(query)) {
                this.workspace.execute(query).then(resolve, reject);
            } else {
                this._executeToService(query).then(result => {
                    let map = new Map<any, any>();
                    let keyName = getEntityMetadata(this.entityType).primaryKey.name;

                    result.forEach(entity => {
                        let key = entity[keyName];

                        try {
                            this.workspace.add({
                                entity: entity,
                                type: query.entityType,
                                expansion: query.expansions
                            });

                            map.set(key, entity);
                        } catch (e) {
                            console.warn(`failed adding part of payload for query ${query.toString()} @ entity #${key}: ${e}`);
                        }
                    });

                    this._executedQueries.set(query.toString(), query);

                    resolve(map);
                }, reject);
            }
        }).then(result => result._map(x => this.toExposed(x)));
    }

    private _executeToService(q: Query): Promise<V[]> {
        if (q instanceof Query.All) {
            return this.loadAll(q);
        } else if (q instanceof Query.ByKey) {
            return this.loadOne(q).then(entity => [entity]);
        } else if (q instanceof Query.ByKeys) {
            return this.loadMany(q);
        } else if (q instanceof Query.ByIndex) {
            return this.loadByIndex(q);
        } else if (q instanceof Query.ByIndexes) {
            return this.loadByIndexes(q);
        } else {
            return Promise.reject<any>(`unknown query type for query ${q.toString()}`);
        }
    }

    private _hasSupersetQueryOf(query: Query): boolean {
        return this._executedQueries._toArray().some(v => v.isSuperSetOf(query));
    }
}
