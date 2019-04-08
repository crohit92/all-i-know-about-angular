# All I know about Angular

### EventEmitter: A wrapper over Subject (rxjs)
``` typescript
export class EventEmitter<T> extends Subject<T> {
    ...
}
```
This class exposes only two methods: 
1. **subscribe**: Subscribe the EventEmitter

 ```typescript
   subscribe(generatorOrNext?: any, error?: any, complete?: any): Subscription {
   	...
   }
 ```

  *<u>generateOrNext</u>*: is a function or an object with next function as a property in it.

  *<u>error</u>*: is a function and is the error handler 

  *<u>complete</u>*: is a function and is invoked when the event stream complete

2. **emit**: Emit an new value to all the subscribers

   ```typescript
   emit(value?: T) { super.next(value); }
   ```

* All other methods on EventEmitter are inherited from Subject

### Event Loop: Javascript runtime

Event loop in its simplest form is a program which runs in an infinite loop and does some processing in each iteration.

There are some task queues which the javascript runtime maintains to segregate various tasks

1. *<u>Microtask queue</u>*: This queue has the call-back functions of ``process.nextTick, Promises, Object.observe, MutationObserver` `
2. *<u>Macrotask queue</u>*: This queue has the callback functions of `setTimeout, setInterval, setImmediate, requestAnimationFrame, I/O, UI rendering`
3. *<u>Call stack</u>*: The current execution context.

To understand the workflow of the event loop one can follow [this video](https://www.youtube.com/watch?v=cCOL7MC4Pl0) or read the following [algorithm](https://stackoverflow.com/a/25933985)

```One go-around of the event loop will have **exactly one** task being processed from the **macrotask queue** (this queue is simply called the *task queue* in the [WHATWG specification](https://html.spec.whatwg.org/multipage/webappapis.html#task-queue)). After this macrotask has finished, all available **microtasks** will be processed, namely within the same go-around cycle. While these microtasks are processed, they can queue even more microtasks, which will all be run one by one, until the microtask queue is exhausted.```

<u>*What are the practical consequences of this?*</u>

If a **microtask** recursively queues other microtasks, it might take a long time until the next macrotask is processed. This means, you could end up with a blocked UI, or some finished I/O idling in your application.

However, at least concerning Node.js's process.nextTick function (which queues **microtasks**), there is an inbuilt protection against such blocking by means of process.maxTickDepth. This value is set to a default of 1000, cutting down further processing of **microtasks** after this limit is reached which allows the next **macrotask** to be processed)

*<u>So when to use what?</u>*

Basically, use **microtasks** when you need to do stuff asynchronously in a synchronous way (i.e. when you would say *perform this (micro-)task in the most immediate future*). Otherwise, stick to **macrotasks**.

