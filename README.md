# @marianmeres/ttl-queue

Add things to queue and have them dequeue sequentially (FIFO) based on their defined expiration (ttl). Read head of the queue as a store value.

## Install

```shell
$ npm i @marianmeres/ttl-queue
```

## Example usage

```typescript
import { createTtlQueueStore } from '@marianmeres/ttl-queue';

// using plain strings here as an example, but the enqueued value can be anything
const q = createTtlQueueStore<string>(defaultTtl?);

// fictional example
const unsub = q.subscribe((head) => screen.show(head));

q.enqueue('one', 1_000);
q.enqueue('two', 2_000);
q.enqueue('three', 3_000);
```

In this example the fictional screen module above will show
"one" for 1 second, _then_ "two" for 2 seconds and _then_ "three" for 3 seconds.

After dequeue of "three" it will be undefined until another `q.enqueue(...)` comes.
