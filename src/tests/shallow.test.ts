import { describe, expect, it } from "vitest";
import { shallow } from "../lib/shallow";

describe("shallow", () => {
  it("Object.is short-circuit", () => {
    const o = { a: 1 };
    expect(shallow(o, o)).toBe(true);
  });

  it("equal keys and values", () => {
    expect(shallow({ a: 1, b: "z" }, { a: 1, b: "z" })).toBe(true);
  });

  it("different key count", () => {
    expect(shallow({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it("different value", () => {
    expect(shallow({ a: 1 }, { a: 2 })).toBe(false);
  });

  it("null and object", () => {
    expect(shallow(null, { a: 1 })).toBe(false);
  });
});
