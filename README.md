# jaxs-bus

*Small message bus and a package used by jaxs (for pub/sub).*

There is a surprising absence of small and flexible message buses for the
client side. This is a small but purpose built message bus. The purpose is
to decouple rendering in jsx from any other concerns in the 
[Jaxs](https://www.github.com/baccigalupi/jaxs) library. It could be used for
other things, because it's just a little message bus.

## Features

The main joy of this little library is that it can match event names via:

* an exact string match
* a regex

A lot of other libraries build little namespacing DSLs, but for me the
superset of needs is fuzzy vs exact matches. How the fuzzy matches happens is
up to you via regexes which are powerful and sometimes even expressive.

```typescript
import { createBus } from 'jaxs-bus'

const exactListener = (payload, listenerOptions) => {
  console.log(`Exact listener: ${listenerOptions.eventName} ${payload}`)
}

const fuzzyListener = (payload, listenerOptions) => {
  console.log(`Fuzzy listener: ${listenerOptions.eventName} ${payload}`)
}

const bus = createBus()
bus.subscribe('exactly', exactListener)
bus.subscribe(/ex.*/, fuzzyListener)

bus.publish('extra', 'extra-payload')
// logged string:
//  Fuzzy listener: extra extra-payload

bus.publish('exactly', 'exactly-payload')
// logged string:
//  Exact listener: exactly exactly-payload
//  Fuzzy listener: exactly exactly-payload
```

Fuzzy listeners are good for things that could be called middleware. For
example, if you wanted to debug events passing through the system you could
subscribe to everything and log out the data you were interested in
understanding:

```typescript
const unsubscribe = bus.subscribe(/.*/, console.log)
```

When you are done with your debuggery, you can go ahead and unsubscribe and 
the logging will stop.

```
unsubscribe()
```

Another good use of fuzzy matcher would be something that does something before
or after certain events. For example, if you were to create a data namespace,
and everytime a prefaced data event comes in you could save to local storage.

```typescript
bus.subscribe(/data:+./, saveToLocalStorage)

bus.publish('not-relevant', {ignore: 'me'}) // ignored by storage efforts
bus.publish('data:new-user', {user: {name: 'Kane'}}) // calls function!
```

## Installation

This is an npm module at [npmjs](https://www.npmjs.com/package/jaxs-bus). Use
your favorite package manager to download and consume.

It is setup for both umd and es6 imports, plus a types file.

It's also very small, dist js is 75 brief lines.
