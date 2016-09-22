import { Workspace } from "./workspace";
import { Expansion } from "./expansion";
import { Metadata } from "./metadata";
import { Query } from "./query";

export interface IRepository<K, V> {
    all(args: any): Promise<Map<K, V>>;
    get(args: { key: K }): Promise<V>;
    getMany(args: { keys: K[] }): Promise<Map<K, V>>;
    save(entity: V): Promise<V>;
    saveMany(entity: V[]): Promise<Map<K, V>>;
}

export class GenericRepository<K, V> implements IRepository<K, V> {
    private _entityType: Metadata;
    private _executedQueries = new Map<string, Query>();
    private _mapper: (dto: any) => V;
    private _queryExecuter: (q: Query) => Promise<any>;
    protected _workspace: Workspace;

    constructor(args: {
        entityType: Metadata;
        queryExecuter: (q: Query) => Promise<any>;
        workspace: Workspace;
        mapper?: (dto: any) => V;
    }) {
        this._entityType = args.entityType;
        this._queryExecuter = args.queryExecuter;
        this._workspace = args.workspace;
        this._mapper = args.mapper || ((dto: any) => dto);
    }

    all(args: {
        expansion?: string;
    }): Promise<Map<K, V>> {
        return this._execute(new Query.All({
            entityType: this._entityType,
            expansions: args.expansion != null ? Expansion.parse(this._entityType, args.expansion) : []
        }));
    }

    get(args: {
        key: K;
        expansion?: string;
    }): Promise<V> {
        return this._execute(new Query.ByKey({
            entityType: this._entityType,
            expansions: args.expansion != null ? Expansion.parse(this._entityType, args.expansion) : [],
            key: args.key
        })).then(result => result.get(args.key));
    }

    getMany(args: {
        keys: K[];
        expansion?: string;
    }): Promise<Map<K, V>> {
        return this._execute(new Query.ByKeys({
            entityType: this._entityType,
            expansions: args.expansion != null ? Expansion.parse(this._entityType, args.expansion) : [],
            keys: args.keys
        }));
    }

    save(entity: V): Promise<V> {
        throw "NotImplemented";
    }

    saveMany(entity: V[]): Promise<Map<K, V>> {
        throw "NotImplemented";
    }

    protected _execute(query: Query): Promise<Map<K, V>> {
        return new Promise<Map<any, any>>((resolve, reject) => {
            if (this._executedQueries.has(query.toString()) || this._hasSupersetQueryOf(query)) {
                this._workspace.execute(query).then(resolve, reject);
            } else {
                this._queryExecuter(query).then(result => {
                    try {
                        this._executedQueries.set(query.toString(), query);

                        if (result instanceof Map) {
                            (result as Map<any, any>).forEach(v => this._workspace.add({ entity: v, type: query.entityType.name, expansion: query.expansions }));
                            resolve(result);
                        } else {
                            this._workspace.add({ entity: result, type: query.entityType.name, expansion: query.expansions });

                            let map = new Map<any, any>();
                            map.set((query as Query.ByKey).key, result);
                            resolve(map);
                        }
                    } catch (error) {
                        reject(error);
                    }
                }, reject);
            }
        }).then(result => result._map(x => this._mapper(x)));
    }

    private _hasSupersetQueryOf(query: Query): boolean {
        return this._executedQueries._toArray().some(v => v.isSuperSetOf(query));
    }
}
