declare module "jaxs-bus" {
    export type JaxsBusListenerOptions = {
        publish: JaxsPublishFunction;
        eventName: string;
        [key: string]: any;
    };
    export type JaxsBusOptions = Record<string, any>;
    export type JaxsPublishFunction = (event: string, payload: any) => void;
    export type JaxsBusListener = (payload: any, listenerKit: JaxsBusListenerOptions) => void;
    export type JaxsBusEventMatcher = string | RegExp;
    type ExactSubscriptionData = {
        listener: JaxsBusListener;
        index: number;
        matcher: string;
    };
    class ExactSubscriptions {
        lookup: Record<string, ExactSubscriptionData[]>;
        constructor();
        add(matcher: JaxsBusEventMatcher, listener: JaxsBusListener, index: number): () => void;
        remove(subscription: ExactSubscriptionData): void;
        matches(event: string): ExactSubscriptionData[];
        ensureArrayFor(matcher: string): void;
    }
    type FuzzySubscriptionData = {
        listener: JaxsBusListener;
        index: number;
        matcher: RegExp;
    };
    class FuzzySubscriptions {
        lookup: FuzzySubscriptionData[];
        constructor();
        add(matcher: JaxsBusEventMatcher, listener: JaxsBusListener, index: number): () => void;
        remove(subscription: FuzzySubscriptionData): void;
        matches(event: string): FuzzySubscriptionData[];
    }
    export class JaxsBus {
        options: JaxsBusOptions;
        exactSubscriptions: ExactSubscriptions;
        fuzzySubscriptions: FuzzySubscriptions;
        currentIndex: number;
        constructor();
        subscribe(matcher: JaxsBusEventMatcher, listener: JaxsBusListener): () => void;
        publish(event: string, payload: any): void;
        addListenerOptions(options: JaxsBusOptions): void;
        listenerOptions(event: string): {
            publish: any;
            eventName: string;
        };
    }
    export const createBus: () => JaxsBus;
}
