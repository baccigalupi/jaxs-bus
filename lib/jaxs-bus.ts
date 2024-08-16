export type JaxsBusListenerOptions<T> = {
  publish: JaxsPublishFunction<T>,
  eventName: string,
  [key: string]: any,
}
export type JaxsBusOptions = Record<string, any>;

export type JaxsPublishFunction<T> = (event: string, payload: T) => void;
export type JaxsBusListener<T> = (
  payload: T,
  listenerKit: JaxsBusListenerOptions<T>
) => void
export type JaxsBusEventMatcher = string | RegExp

type ExactSubscriptionData<T> = {
  listener: JaxsBusListener<T>,
  index: number,
  matcher: string,
}
class ExactSubscriptions<T> {
  lookup: Record<string, ExactSubscriptionData<T>[]>;

  constructor() {
    this.lookup = {}
  }

  add(matcher: JaxsBusEventMatcher, listener: JaxsBusListener<T>, index: number) {
    this.ensureArrayFor(matcher as string)
    const subscription = { listener, index, matcher } as ExactSubscriptionData<T>
    this.lookup[matcher as string].push(subscription)
    return () => this.remove(subscription)
  }

  remove(subscription: ExactSubscriptionData<T>) {
    if (!this.lookup[subscription.matcher]) return;

    this.lookup[subscription.matcher] = this
      .lookup[subscription.matcher]
      .reduce((aggregate, currentSubscription) => {
        if (currentSubscription !== subscription) {
          aggregate.push(currentSubscription)
        }
        return aggregate
      }, [] as ExactSubscriptionData<T>[])
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

type FuzzySubscriptionData<T> = {
  listener: JaxsBusListener<T>,
  index: number,
  matcher: RegExp,
}
class FuzzySubscriptions<T> {
  lookup: FuzzySubscriptionData<T>[];

  constructor() {
    this.lookup = []
  }
  
  add(matcher: JaxsBusEventMatcher, listener: JaxsBusListener<T>, index: number) {
    const subscription = { listener, index, matcher: matcher as RegExp }
    this.lookup.push(subscription);
    return () => this.remove(subscription)
  }

  remove(subscription: FuzzySubscriptionData<T>) {
    this.lookup = this.lookup.reduce((aggregate, currentSubscription) => {
      if (currentSubscription !== subscription) {
        aggregate.push(currentSubscription)
      }
      return aggregate
    }, [] as FuzzySubscriptionData<T>[])
  }

  matches(event: string) {
    return this.lookup.filter((subscription) => subscription.matcher.test(event))
  }
}

export class JaxsBus<T> {
  options: JaxsBusOptions;
  exactSubscriptions: ExactSubscriptions<T>;
  fuzzySubscriptions: FuzzySubscriptions<T>;
  currentIndex: number;

  constructor() {
    this.options = {}
    this.exactSubscriptions = new ExactSubscriptions()
    this.fuzzySubscriptions = new FuzzySubscriptions()
    this.currentIndex = 0;
  }

  subscribe(matcher: JaxsBusEventMatcher, listener: JaxsBusListener<T>) {
    const collection = typeof matcher === 'string' ? this.exactSubscriptions : this.fuzzySubscriptions
    const unsubscribe = collection.add(matcher, listener, this.currentIndex)
    this.currentIndex += 1;
    return unsubscribe;
  }

  publish(event: string, payload: T) {
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