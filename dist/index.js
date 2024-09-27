import { createDerivedStore, createStore } from '@marianmeres/store';
export const createTtlQueueStore = (defaultTtl = 0, options = {}) => {
    const _log = (...args) => { var _a; return (_a = options === null || options === void 0 ? void 0 : options.logger) === null || _a === void 0 ? void 0 : _a.apply(null, [Date.now(), ...args]); };
    //
    let _queue = [];
    const _head = createStore();
    //
    let _timer = null;
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
    const enqueue = (item, ttl) => {
        ttl !== null && ttl !== void 0 ? ttl : (ttl = defaultTtl);
        const id = _getId();
        let err = `Expecting positive non-zero number of milliseconds`;
        if (typeof ttl !== 'number')
            throw new TypeError(`${err} (1)`);
        if (ttl <= 0)
            throw new TypeError(`${err} (2)`);
        _log('enqueue', { item, ttl, id });
        _queue = [..._queue, { item, ttl, id }];
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
    const { subscribe, get } = createDerivedStore([_head], ([h]) => h === null || h === void 0 ? void 0 : h.item);
    //
    const reset = () => {
        _log('reset');
        _resetTimer();
        _queue = [];
        _syncHead();
    };
    return { subscribe, get, enqueue, reset };
};
