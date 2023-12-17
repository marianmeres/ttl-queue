# @marianmeres/ttl-queue

Add things to [queue](<https://en.wikipedia.org/wiki/Queue_(abstract_data_type)>) and have them dequeue sequentially (FIFO) based on their defined expiration (ttl). Read head of the queue as a [store](https://github.com/marianmeres/store) value.

## Install

```shell
$ npm i @marianmeres/ttl-queue
```

## Example usage

```typescript
import { createTtlQueueStore } from '@marianmeres/ttl-queue';

// Using plain strings here just as an example (the enqueued value can be anything).
const q = createTtlQueueStore<string>(defaultTtl?);

// fictional example
const unsub = q.subscribe((head) => screen.show(head));

q.enqueue('one', 1_000);
q.enqueue('two', 2_000);
q.enqueue('three', 3_000);
```

In this example the fictional screen module above will show
"one" for 1 second, _then_ "two" for 2 seconds and _then_ "three" for 3 seconds.

After dequeue of "three" the store value (the head) will be undefined until another `q.enqueue(...)` comes.
