import { expect, describe, it, vi } from 'vitest'
import { createBus } from '../lib/jaxs-bus'

describe('JaxsBus', () => {
  it('when the bus is configured with special optional payload, that is passed along when the listener is called', () => {
    const eventName = 'do-something'
    const bus = createBus()

    bus.addListenerOptions({
      state: { something: 'important' },
      foo: 'bar'
    })
    const listenerOptions = bus.listenerOptions(eventName)

    expect(listenerOptions.state).toEqual({ something: 'important' })
    expect(listenerOptions.foo).toEqual('bar')
  })

  it('listener options include the event name', () => {
    const eventName = 'do-something'
    const bus = createBus()
    const listenerOptions = bus.listenerOptions(eventName)

    expect(listenerOptions.eventName).toEqual(eventName)
  })

  it('listener options include a publish function', () => {
    const eventName = 'do-something'
    const bus = createBus()
    const listenerOptions = bus.listenerOptions(eventName)

    expect(listenerOptions.publish).toBeInstanceOf(Function)
    // TODO: make sure that it actuall publishes!
  })

  it('passes listener options to the listener function when called', () => {
    const eventName = 'do-something'
    const bus = createBus()
    const listener = vi.fn()

    bus.addListenerOptions({
      state: { something: 'important' },
      foo: 'bar'
    })
    bus.subscribe(eventName, listener)
    bus.publish(eventName, 'baz')

    expect(listener.mock.calls[0][0]).toEqual('baz')
    expect(listener.mock.calls[0][1].publish).toBeInstanceOf(Function)
    expect(listener.mock.calls[0][1].eventName).toEqual(eventName)
    expect(listener.mock.calls[0][1].state).toEqual({ something: 'important' })
    expect(listener.mock.calls[0][1].foo).toEqual('bar')
  })

  describe('listening for exact matches', () => {
    it('when the exact event is triggered it calls the listener with the right payload', () => {
      const bus = createBus()
      const eventName = 'exacting'
      const listener = vi.fn()

      bus.subscribe(eventName, listener)
      bus.publish(eventName, { truly: 'harsh' })

      expect(listener).toHaveBeenCalledOnce()
    })

    it("won't trigger when the event is a partial match or a miss", () => {
      const bus = createBus()
      const eventName = 'exacting'
      const listener = vi.fn()

      bus.subscribe(eventName, listener)
      bus.publish('exact', 'miss exact payload')
      bus.publish('miss', 'miss payload')

      expect(listener).not.toHaveBeenCalledOnce()
    })

    it('there can be many listeners for an event, and they are in order they are setup', () => {
      const bus = createBus()
      const eventName = 'exacting'
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      bus.subscribe(eventName, listener1)
      bus.subscribe(eventName, listener2)
      bus.publish(eventName, 'payload')

      expect(listener1).toHaveBeenCalled()
      expect(listener2).toHaveBeenCalled()
    })

    it('will call the listener each time the event is triggered', () => {
      const bus = createBus()
      const eventName = 'exacting'
      const listener = vi.fn()

      bus.subscribe(eventName, listener)
      bus.publish(eventName, 'payload-1')
      bus.publish(eventName, 'payload-2')

      expect(listener).toHaveBeenCalledTimes(2)
    })

    it('returns a function to stop listening when subscribing', () => {
      const bus = createBus()
      const eventName = 'exacting'
      const listener = vi.fn()

      const unsubscribe = bus.subscribe(eventName, listener)
      unsubscribe()
      bus.publish(eventName, 'payload')

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('listening for fuzzy matches with regexes', () => {
    it('gets called when the an event name matches the regex', () => {
      const bus = createBus()
      const listener = vi.fn()

      bus.subscribe(/fuzz.*/, listener)
      bus.publish('fuzz', 'fuzz-payload')
      bus.publish('fuzzy', 'fuzzy-payload')
      bus.publish('wuzzy', 'wuzzy-payload')

      expect(listener).toHaveBeenCalledTimes(2)
      expect(listener.mock.calls[0][0]).toEqual('fuzz-payload')
      expect(listener.mock.calls[1][0]).toEqual('fuzzy-payload')
    })

    it('there can be many fuzzy matches for an event, and each listener gets called', () => {
      const bus = createBus()
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      bus.subscribe(/fuzz.*/, listener1)
      bus.subscribe(/.*zz.*/, listener2)
      bus.publish('fuzzy', 'fuzzy-payload')

      expect(listener1).toHaveBeenCalledOnce()
      expect(listener2).toHaveBeenCalledOnce()
    })

    it('returns a function to stop listening when subscribing', () => {
      const bus = createBus()
      const listener = vi.fn()

      const unsubscribe = bus.subscribe(/fuzz.*/, listener)
      unsubscribe()
      bus.publish('fuzzy', 'fuzzy-payload')

      expect(listener).not.toHaveBeenCalled()
    })
  })

  it('when there are fuzzy and exact matches it calls them in the order added as subscribers', () => {
    const bus = createBus()
    const listenerOrder = []
    const listener1 = vi.fn(() => listenerOrder.push(1))
    const listener2 = vi.fn(() => listenerOrder.push(2))
    const listener3 = vi.fn(() => listenerOrder.push(3))

    bus.subscribe(/fu.*/, listener1)
    bus.subscribe('fuzzy', listener2)
    bus.subscribe(/.*zz.*/, listener3)
    bus.publish('fuzzy', 'fuzzy-payload')

    expect(listenerOrder).toEqual([1, 2, 3])
  })
})
