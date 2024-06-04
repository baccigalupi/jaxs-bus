

export type JaxsBusListenerOptions = {
  publish: JaxsPublishFunction,
  eventName: string,
  [key: string]: any,
}
export type JaxsBusOptions = Record<string, any>;

export type JaxsPublishFunction = (event: string, payload: any) => void;
export type JaxsBusListener = (
  payload: any,
  listenerKit: JaxsBusListenerOptions
) => void
export type JaxsBusEventMatcher = string | RegExp

type ExactSubscriptionData = {
  listener: JaxsBusListener,
  index: number,
  matcher: string,
}
class ExactSubscriptions {
  lookup: Record<string, ExactSubscriptionData[]>;

  constructor() {
    this.lookup = {}
  }

  add(matcher: JaxsBusEventMatcher, listener: JaxsBusListener, index: number) {
    this.ensureArrayFor(matcher as string)
    const subscription = { listener, index, matcher } as ExactSubscriptionData
    this.lookup[matcher as string].push(subscription)
    return () => this.remove(subscription)
  }

  remove(subscription: ExactSubscriptionData) {
    if (!this.lookup[subscription.matcher]) return;

    this.lookup[subscription.matcher] = this
      .lookup[subscription.matcher]
      .reduce((aggregate, currentSubscription) => {
        if (currentSubscription !== subscription) {
          aggregate.push(currentSubscription)
        }
        return aggregate
      }, [] as ExactSubscriptionData[])
  }

  matches(event: string) {
    return this.lookup[event] || []
  }

  ensureArrayFor(matcher: string) {
    if (!this.lookup[matcher]) {
      this.lookup[matcher] = []
    }
  }
}

type FuzzySubscriptionData = {
  listener: JaxsBusListener,
  index: number,
  matcher: RegExp,
}
class FuzzySubscriptions {
  lookup: FuzzySubscriptionData[];

  constructor() {
    this.lookup = []
  }
  
  add(matcher: JaxsBusEventMatcher, listener: JaxsBusListener, index: number) {
    const subscription = { listener, index, matcher: matcher as RegExp }
    this.lookup.push(subscription);
    return () => this.remove(subscription)
  }

  remove(subscription: FuzzySubscriptionData) {
    this.lookup = this.lookup.reduce((aggregate, currentSubscription) => {
      if (currentSubscription !== subscription) {
        aggregate.push(currentSubscription)
      }
      return aggregate
    }, [] as FuzzySubscriptionData[])
  }

  matches(event: string) {
    return this.lookup.filter((subscription) => subscription.matcher.test(event))
  }
}

export class JaxsBus {
  options: JaxsBusOptions;
  exactSubscriptions: ExactSubscriptions;
  fuzzySubscriptions: FuzzySubscriptions;
  currentIndex: number;

  constructor() {
    this.options = {}
    this.exactSubscriptions = new ExactSubscriptions()
    this.fuzzySubscriptions = new FuzzySubscriptions()
    this.currentIndex = 0;
  }

  subscribe(matcher: JaxsBusEventMatcher, listener: JaxsBusListener) {
    const collection = typeof matcher === 'string' ? this.exactSubscriptions : this.fuzzySubscriptions
    const unsubscribe = collection.add(matcher, listener, this.currentIndex)
    this.currentIndex += 1;
    return unsubscribe;
  }

  publish(event: string, payload: any) {
    const subscriptions = [
      ...this.exactSubscriptions.matches(event),
      ...this.fuzzySubscriptions.matches(event),
    ].sort((left, right) => left.index - right.index)

    subscriptions.forEach((subscription) => {
      subscription.listener(payload, this.listenerOptions(event))
    })
  }

  addListenerOptions(options: JaxsBusOptions) {
    this.options = options;
  }

  listenerOptions(event: string) {
    return {
      eventName: event,
      ...this.options,
      publish: this.publish.bind(this)
    }
  }
}

export const createBus = () => new JaxsBus()