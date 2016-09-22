import { Metadata } from "../metadata";
import { IRepository } from "../repository";

export class ODataRepository<K, V> implements IRepository<K, V> {
    constructor(args: {
        url: string;
        metadata: Metadata;
    }) {

    }

    all(): Promise<Map<K, V>> {
        throw "";
    }

    get(args: { key: K }): Promise<V> {
        throw "";
    }

    getMany(args: { keys: K[] }): Promise<Map<K, V>> {
        throw "";
    }

    save(entity: V): Promise<V> {
        throw "";
    }

    saveMany(entity: V[]): Promise<Map<K, V>> {
        throw "";
    }
}
