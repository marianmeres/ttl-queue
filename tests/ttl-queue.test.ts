import { createClog } from '@marianmeres/clog';
import { TestRunner } from '@marianmeres/test-runner';
import { strict as assert } from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createTtlQueueStore } from '../src/index.js';

const clog = createClog(path.basename(fileURLToPath(import.meta.url)));
const suite = new TestRunner(path.basename(fileURLToPath(import.meta.url)));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

suite.test('basic flow', async () => {
	const q = createTtlQueueStore<any>(50, {
		// logger: createClog('debug'),
	});

	let _log: any[] = [];
	const unsub = q.subscribe((head) => {
		_log.push([Date.now(), head]);
	});

	q.enqueue('hey');
	q.enqueue('ho', 100);
	q.enqueue('lets');
	q.enqueue('go');

	await sleep(300);
	unsub();

	assert(q.get() === undefined);
	assert(_log.length === 6);
	assert(_log.map((v) => `${v[1]}`).join(',') === 'undefined,hey,ho,lets,go,undefined');

	// remove first and last
	_log = _log.slice(1, -1);
	// clog(_log);

	// ttl 50
	const delta_0_1 = Math.abs(_log[0][0] - _log[1][0]);
	assert(40 < delta_0_1 && delta_0_1 < 60);

	// ttl 100
	const delta_1_2 = Math.abs(_log[1][0] - _log[2][0]);
	assert(90 < delta_1_2 && delta_1_2 < 110);

	// ttl 50
	const delta_2_3 = Math.abs(_log[2][0] - _log[3][0]);
	assert(40 < delta_2_3 && delta_2_3 < 60);
});

suite.test('with reset', async () => {
	const q = createTtlQueueStore<any>(50, {
		// logger: createClog('debug'),
	});

	let _log: any[] = [];
	const unsub = q.subscribe((head) => {
		head && _log.push(head);
	});

	q.enqueue('hey');
	q.enqueue('ho');
	q.enqueue('lets');
	q.enqueue('go');

	await sleep(80);
	q.reset();
	// clog(_log);

	// only the first 2 must have made it to "head"
	assert(_log.length === 2);
	assert(_log.join() === 'hey,ho');

	unsub();
});

suite.test('same ref must not update store value', async () => {
	const a = { a: 1 };
	const b = { b: 2 };

	const q = createTtlQueueStore<any>(50, {
		// logger: createClog('debug'),
	});

	let _log: any[] = [];
	const unsub = q.subscribe((head) => {
		head && _log.push([Date.now(), head]);
	});

	// same reference will be added to queue and head normaly... but the store will
	// not be updated, which is correct
	q.enqueue(a);
	q.enqueue(a);
	q.enqueue(b);
	q.enqueue(b);

	await sleep(300);
	unsub();
	// clog(_log);

	assert(_log.length === 2); // not 4

	const delta = Math.abs(_log[0][0] - _log[1][0]);

	// IMPORTANT: 2 * 50 (logged just once, but the head was updated with the same ref)
	assert(90 < delta && delta < 110);
});

export default suite;
