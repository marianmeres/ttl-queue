import { StoreReadable, createDerivedStore, createStore } from '@marianmeres/store';

// internal
interface QueueData<T> {
	item: T;
	ttl: number;
	_isHead: boolean; // helper flag
	// for future addons (e.g. to change ttl for items already in queue)
	id: string | number;
}

export interface CreateTtlQueueStoreOptions {
	logger: (...args) => void;
}

export interface QueueStore<T> extends StoreReadable<T> {
	enqueue: (item: T, ttl?: number) => number;
	reset: () => void;
}

export const createTtlQueueStore = <T>(
	defaultTtl: number = 0,
	options: Partial<CreateTtlQueueStoreOptions> = {}
): QueueStore<T> => {
	const _log = (...args) => options?.logger?.apply(null, [Date.now(), ...args]);

	//
	let _queue: QueueData<T>[] = [];
	const _head = createStore<QueueData<T>>();

	//
	let _timer: any = null;
	const _resetTimer = () => {
		if (_timer) {
			clearTimeout(_timer);
			_timer = null;
		}
	};

	//
	let _id = 0;
	const _getId = () => ++_id;

	//
	const _syncHead = () => {
		if (_queue[0] && !_queue[0]._isHead) {
			_log('_syncHead', _queue[0]);
			_queue[0]._isHead = true;
			if (_timer) {
				_log('Unexpected timer present');
				_resetTimer();
			}
			_timer = setTimeout(() => {
				_timer = null;
				_dequeue();
			}, _queue[0].ttl);
		}
		_head.set(_queue[0]);
	};

	//
	const enqueue = (item: T, ttl?: number): number => {
		ttl ??= defaultTtl;
		const id = _getId();

		let err = `Expecting positive non-zero number of milliseconds`;
		if (typeof ttl !== 'number') throw new TypeError(`${err} (1)`);
		if (ttl <= 0) throw new TypeError(`${err} (2)`);

		_log('enqueue', { item, ttl, id });
		_queue = [..._queue, { item, ttl, id } as QueueData<T>];
		_syncHead();

		return id;
	};

	//
	const _dequeue = () => {
		_log('_dequeue');
		_queue = [..._queue.slice(1)];
		_syncHead();
	};

	//
	const { subscribe, get } = createDerivedStore<T>([_head], ([h]) => h?.item);

	//
	const reset = () => {
		_log('reset');
		_resetTimer();
		_queue = [];
		_syncHead();
	};

	return { subscribe, get, enqueue, reset };
};
