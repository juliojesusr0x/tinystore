import { describe, expect, it, vi } from "vitest";
import { createStore } from "../lib/createStore";

describe("createStore", () => {
  it("getState returns initial state", () => {
    const store = createStore({ count: 0, label: "a" });
    expect(store.getState()).toEqual({ count: 0, label: "a" });
  });

  it("setState merges a partial object", () => {
    const store = createStore({ count: 0, label: "a" });
    store.setState({ count: 2 });
    expect(store.getState()).toEqual({ count: 2, label: "a" });
  });

  it("setState accepts an updater function", () => {
    const store = createStore({ count: 1 });
    store.setState((s) => ({ count: s.count + 5 }));
    expect(store.getState().count).toBe(6);
  });

  it("subscribe notifies with (next, prev)", () => {
    const store = createStore({ n: 0 });
    const spy = vi.fn();
    store.subscribe(spy);
    store.setState({ n: 1 });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ n: 1 }, { n: 0 });
  });

  it("unsubscribe stops notifications", () => {
    const store = createStore({ x: 0 });
    const spy = vi.fn();
    const unsub = store.subscribe(spy);
    unsub();
    store.setState({ x: 1 });
    expect(spy).not.toHaveBeenCalled();
  });

  it("notifies multiple subscribers", () => {
    const store = createStore({ v: 0 });
    const a = vi.fn();
    const b = vi.fn();
    store.subscribe(a);
    store.subscribe(b);
    store.setState({ v: 10 });
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });
});
