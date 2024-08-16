declare module "jaxs-bus" {
    export type JaxsBusListenerOptions<T> = {
        publish: JaxsPublishFunction<T>;
        eventName: string;
        [key: string]: any;
    };
    export type JaxsBusOptions = Record<string, any>;
    export type JaxsPublishFunction<T> = (event: string, payload: T) => void;
    export type JaxsBusListener<T> = (payload: T, listenerKit: JaxsBusListenerOptions<T>) => void;
    export type JaxsBusEventMatcher = string | RegExp;
    type ExactSubscriptionData<T> = {
        listener: JaxsBusListener<T>;
        index: number;
        matcher: string;
    };
    class ExactSubscriptions<T> {
        lookup: Record<string, ExactSubscriptionData<T>[]>;
        constructor();
        add(matcher: JaxsBusEventMatcher, listener: JaxsBusListener<T>, index: number): () => void;
        remove(subscription: ExactSubscriptionData<T>): void;
        matches(event: string): ExactSubscriptionData<T>[];
        ensureArrayFor(matcher: string): void;
    }
    type FuzzySubscriptionData<T> = {
        listener: JaxsBusListener<T>;
        index: number;
        matcher: RegExp;
    };
    class FuzzySubscriptions<T> {
        lookup: FuzzySubscriptionData<T>[];
        constructor();
        add(matcher: JaxsBusEventMatcher, listener: JaxsBusListener<T>, index: number): () => void;
        remove(subscription: FuzzySubscriptionData<T>): void;
        matches(event: string): FuzzySubscriptionData<T>[];
    }
    export class JaxsBus<T> {
        options: JaxsBusOptions;
        exactSubscriptions: ExactSubscriptions<T>;
        fuzzySubscriptions: FuzzySubscriptions<T>;
        currentIndex: number;
        constructor();
        subscribe(matcher: JaxsBusEventMatcher, listener: JaxsBusListener<T>): () => void;
        publish(event: string, payload: T): void;
        addListenerOptions(options: JaxsBusOptions): void;
        listenerOptions(event: string): {
            publish: any;
            eventName: string;
        };
    }
    export const createBus: () => JaxsBus<unknown>;
}
