var n = Object.defineProperty;
var c = (r, s, t) => s in r ? n(r, s, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[s] = t;
var u = (r, s, t) => (c(r, typeof s != "symbol" ? s + "" : s, t), t);
class h {
  constructor() {
    u(this, "lookup");
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
    u(this, "lookup");
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
    u(this, "options");
    u(this, "exactSubscriptions");
    u(this, "fuzzySubscriptions");
    u(this, "currentIndex");
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
const b = () => new l();
export {
  l as JaxsBus,
  b as createBus
};
