import { afterEach, describe, expect, it, vi } from "vitest";
import { createStore } from "../lib/createStore";
import { debug } from "../lib/debug";

describe("debug", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs prev, next, and changed keys", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const store = createStore({ a: 1, b: 2 });
    const unsub = debug(store, "t");
    store.setState({ a: 3 });
    expect(log).toHaveBeenCalled();
    const payload = log.mock.calls[0]?.[1] as {
      changed: string[];
    };
    expect(payload.changed).toContain("a");
    unsub();
  });
});
