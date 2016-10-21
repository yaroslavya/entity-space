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

export module Repository {
    export interface IMapper<V, M> {
        toInternal: (entity: M) => V;
        toExposed: (entity: V) => M;
    }
}

/**
 * K = primitive type of id
 * V = actual type stored
 * M = type exposed to consumer
 */
export class Repository<K, V, M> implements IRepository<K, M> {
    protected _workspace: Workspace;
    protected _entityType: Metadata;
    private _executedQueries = new Map<string, Query>();
    private _mapper: Repository.IMapper<V, M>;
    private _queryExecuter: (q: Query) => Promise<any>;

    constructor(args: {
        entityType: Metadata;
        queryExecuter: (q: Query) => Promise<any>;
        workspace: Workspace;
        mapper?: Repository.IMapper<V, M>;
    }) {
        this._entityType = args.entityType;
        this._queryExecuter = args.queryExecuter;
        this._workspace = args.workspace;
        this._mapper = args.mapper || {
            toInternal: (entity: M) => entity as any as V,
            toExposed: (entity: V) => entity as any as M
        };
    }

    all(args?: {
        expansion?: string;
    }): Promise<Map<K, M>> {
        args = args || {};

        return this._execute(new Query.All({
            entityType: this._entityType,
            expansions: args.expansion != null ? Expansion.parse(this._entityType, args.expansion) : []
        }));
    }

    get(args: {
        key: K;
        expansion?: string;
    }): Promise<M> {
        return this._execute(new Query.ByKey({
            entityType: this._entityType,
            expansions: args.expansion != null ? Expansion.parse(this._entityType, args.expansion) : [],
            key: args.key
        })).then(result => result.get(args.key));
    }

    getMany(args: {
        keys: K[];
        expansion?: string;
    }): Promise<Map<K, M>> {
        return this._execute(new Query.ByKeys({
            entityType: this._entityType,
            expansions: args.expansion != null ? Expansion.parse(this._entityType, args.expansion) : [],
            keys: args.keys
        }));
    }

    save(entity: M): Promise<M> {
        throw "NotImplemented";
    }

    saveMany(entity: M[]): Promise<Map<K, M>> {
        throw "NotImplemented";
    }

    protected _execute(query: Query): Promise<Map<K, M>> {
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
        }).then(result => result._map(x => this._mapper.toExposed(x)));
    }

    private _hasSupersetQueryOf(query: Query): boolean {
        return this._executedQueries._toArray().some(v => v.isSuperSetOf(query));
    }
}
