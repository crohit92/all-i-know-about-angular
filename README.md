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

### [Zonejs](https://github.com/angular/zone.js/blob/master/lib/zone.ts)
Zone is a mechanism for intercepting and keeping track of asynchronous work.

It is used to intercept all async APIs and monkey patch some code before and after the async code.

The key interfaces in a Zone are:

1. Zone: Execution Context
2. ZoneSpec: Spec of a Zone. Spec allows a zone to override methods defined by the parent Zone
3. ZoneDelegate: Helps in delegating zone hooks from a child zone to all its ancestors one by one

##### Creating a Zone

A Zone can be created by invoking one of three following methods: 

1. `zone.fork`

2. `new Zone`

3. `parentZoneDelegate.fork`


> Each Zone has a `fork` method which is responsible for creating a child zone. A Zone has its `_zoneDelegate` which has `_forkZS` (Fork Zone Spec which is nothing but a ZoneSpec object) only if either it has a defined `onFork` method in its spec or any of its ancestors have it defined. This is because the ZoneDelagate's constructor runs `this._forkZS = zoneSpec && (zoneSpec && zoneSpec.onFork ? zoneSpec : parentDelegate!._forkZS);`. If any of the Zone defines an `onFork` method in its spec, then it and all its decedents must have a `_forkZS !=== null` 



> Any Zone which does not have an `onFork` method in its spec  gets its `_forkZS` from its parent's ZoneDelegate. So if in a tree of zones, no zone define their `onFork`, then all the child zones of the `<root>` zone have their delegate's `_forkZS === null`.



>  Zone's `fork` method calls its delegate's fork method, which checks if has a `_forkZS` defined. if it is defined ( which means someone from the `currentTargetZone` to the `<root>` zone have its `onFork` defined ) then the defined `onFork` method is called to retrieve a new child zone, otherwise an new Zone is created `new Zone(targetZone, zoneSpec)`. 



> ZoneDelegate is used so that each parent zone of the targetZone which have subscribed to any zone hooks can be notified for the same.



```typescript
public fork(zoneSpec: ZoneSpec): AmbientZone {
	if (!zoneSpec) throw new Error('ZoneSpec required!');
    return this._zoneDelegate.fork(this, zoneSpec);
}
```

A ZoneDelegate is created when a new Zone is created

```typescript
class Zone implements AmbientZone {
	...
	constructor(parent: Zone|null, zoneSpec: ZoneSpec|null) {
      this._parent = parent;
      this._name = zoneSpec ? zoneSpec.name || 'unnamed' : '<root>';
      this._properties = zoneSpec && zoneSpec.properties || {};
      this._zoneDelegate =
          new ZoneDelegate(this, this._parent && this._parent._zoneDelegate, zoneSpec);
    }
    ...
    public fork(zoneSpec: ZoneSpec): AmbientZone {
      if (!zoneSpec) throw new Error('ZoneSpec required!');
      return this._zoneDelegate.fork(this, zoneSpec);
    }
	...
}
```

ZoneDelegate

```typescript
class ZoneDelegate implements AmbientZoneDelegate {
	...
	constructor(zone: Zone, parentDelegate: ZoneDelegate|null, zoneSpec: ZoneSpec|null) {
		this.zone = zone;
		this._parentDelegate = parentDelegate;
		
		// ZoneSpec of the Zone
		 this._forkZS = zoneSpec && (zoneSpec && zoneSpec.onFork ? zoneSpec : parentDelegate!._forkZS);
		
		// ParentZoneDelegate
      [this._forkDlgt = zoneSpec && (zoneSpec.onFork ? parentDelegate : parentDelegate!._forkDlgt);]
		
		...
    }
    ...
    fork(targetZone: Zone, zoneSpec: ZoneSpec): AmbientZone {
      return this._forkZS ? this._forkZS.onFork!(this._forkDlgt!, this.zone, targetZone, zoneSpec) : new Zone(targetZone, zoneSpec);
    }
}
```

Reference:

[Doc](<https://docs.google.com/document/d/1F5Ug0jcrm031vhSMJEOgp1l-Is-Vf0UCNDY-LsQtAIY/edit#>)

[Standard API](<https://github.com/angular/zone.js/blob/master/STANDARD-APIS.md>)

