var n = Object.defineProperty;
var c = (u, s, t) => s in u ? n(u, s, { enumerable: !0, configurable: !0, writable: !0, value: t }) : u[s] = t;
var r = (u, s, t) => (c(u, typeof s != "symbol" ? s + "" : s, t), t);
class h {
  constructor() {
    r(this, "lookup");
    this.lookup = {};
  }
  add(s, t, i) {
    this.ensureArrayFor(s);
    const o = { listener: t, index: i, matcher: s };
    return this.lookup[s].push(o), () => this.remove(o);
  }
  remove(s) {
    this.lookup[s.matcher] && (this.lookup[s.matcher] = this.lookup[s.matcher].reduce((t, i) => (i !== s && t.push(i), t), []));
  }
  matches(s) {
    return this.lookup[s] || [];
  }
  ensureArrayFor(s) {
    this.lookup[s] || (this.lookup[s] = []);
  }
}
class p {
  constructor() {
    r(this, "lookup");
    this.lookup = [];
  }
  add(s, t, i) {
    const o = { listener: t, index: i, matcher: s };
    return this.lookup.push(o), () => this.remove(o);
  }
  remove(s) {
    this.lookup = this.lookup.reduce((t, i) => (i !== s && t.push(i), t), []);
  }
  matches(s) {
    return this.lookup.filter((t) => t.matcher.test(s));
  }
}
class l {
  constructor() {
    r(this, "options");
    r(this, "exactSubscriptions");
    r(this, "fuzzySubscriptions");
    r(this, "currentIndex");
    this.options = {}, this.exactSubscriptions = new h(), this.fuzzySubscriptions = new p(), this.currentIndex = 0;
  }
  subscribe(s, t) {
    const o = (typeof s == "string" ? this.exactSubscriptions : this.fuzzySubscriptions).add(s, t, this.currentIndex);
    return this.currentIndex += 1, o;
  }
  publish(s, t) {
    [
      ...this.exactSubscriptions.matches(s),
      ...this.fuzzySubscriptions.matches(s)
    ].sort((o, e) => o.index - e.index).forEach((o) => {
      o.listener(t, this.listenerOptions(s));
    });
  }
  addListenerOptions(s) {
    this.options = s;
  }
  listenerOptions(s) {
    return {
      eventName: s,
      ...this.options,
      publish: this.publish.bind(this)
    };
  }
}
const a = () => {
  const u = new l();
  return {
    bus: u,
    publish: (i, o) => u.publish(i, o),
    subscribe: (i, o) => u.subscribe(i, o)
  };
};
export {
  l as JaxsBus,
  a as createBus
};
