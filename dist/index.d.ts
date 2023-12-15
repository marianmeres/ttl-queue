import { StoreReadable } from '@marianmeres/store';
export interface CreateTtlQueueStoreOptions {
    logger: (...args: any[]) => void;
}
export interface QueueStore<T> extends StoreReadable<T> {
    enqueue: (item: T, ttl?: number) => number;
    reset: () => void;
}
export declare const createTtlQueueStore: <T>(defaultTtl?: number, options?: Partial<CreateTtlQueueStoreOptions>) => QueueStore<T>;
