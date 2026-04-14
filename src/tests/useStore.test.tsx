import { act, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { createStore } from "../lib/createStore";
import { shallow } from "../lib/shallow";
import { useStore } from "../lib/useStore";

describe("useStore", () => {
  it("without selector returns full state and updates", () => {
    const store = createStore({ a: 1, b: 2 });
    function Comp() {
      const s = useStore(store);
      return (
        <button type="button" onClick={() => store.setState({ a: s.a + 1 })}>
          {s.a}-{s.b}
        </button>
      );
    }
    render(<Comp />);
    const btn = screen.getByRole("button");
    expect(btn.textContent).toBe("1-2");
    act(() => {
      btn.click();
    });
    expect(btn.textContent).toBe("2-2");
  });

  it("selector only re-renders when selected slice changes", () => {
    const store = createStore({ name: "ada", age: 36 });
    const nameRenders = vi.fn();
    const ageRenders = vi.fn();

    function Name() {
      nameRenders();
      const name = useStore(store, (s) => s.name);
      return <span data-testid="name">{name}</span>;
    }
    function Age() {
      ageRenders();
      const age = useStore(store, (s) => s.age);
      return <span data-testid="age">{age}</span>;
    }
    function Driver() {
      return (
        <>
          <Name />
          <Age />
          <button
            type="button"
            onClick={() => store.setState({ name: "alan" })}
          >
            ch name
          </button>
          <button type="button" onClick={() => store.setState({ age: 37 })}>
            ch age
          </button>
        </>
      );
    }

    render(<Driver />);
    expect(screen.getByTestId("name").textContent).toBe("ada");
    expect(nameRenders).toHaveBeenCalledTimes(1);
    expect(ageRenders).toHaveBeenCalledTimes(1);

    act(() => {
      screen.getByRole("button", { name: "ch name" }).click();
    });
    expect(nameRenders).toHaveBeenCalledTimes(2);
    expect(ageRenders).toHaveBeenCalledTimes(1);

    act(() => {
      screen.getByRole("button", { name: "ch age" }).click();
    });
    expect(ageRenders).toHaveBeenCalledTimes(2);
  });

  it("equalityFn shallow avoids re-render when selected object shape matches", () => {
    const store = createStore({ a: 1, b: 2 });
    const renders = vi.fn();

    function Slice() {
      renders();
      const slice = useStore(
        store,
        (s) => ({ a: s.a, b: s.b }),
        shallow,
      );
      return (
        <span>
          {slice.a}-{slice.b}
        </span>
      );
    }

    render(<Slice />);
    expect(renders).toHaveBeenCalledTimes(1);

    act(() => {
      store.setState({ a: 1, b: 2 });
    });
    expect(renders).toHaveBeenCalledTimes(1);
  });
});

describe("useStore + render count ref (non-subscribed slice)", () => {
  it("does not bump child render ref when another slice updates", () => {
    const store = createStore({ title: "x", count: 0 });

    function TitleView() {
      const r = useRef(0);
      r.current += 1;
      const title = useStore(store, (s) => s.title);
      return (
        <div>
          <span data-testid="title">{title}</span>
          <span data-testid="title-renders">{r.current}</span>
        </div>
      );
    }

    function CountView() {
      const r = useRef(0);
      r.current += 1;
      const count = useStore(store, (s) => s.count);
      return (
        <div>
          <span data-testid="count">{count}</span>
          <span data-testid="count-renders">{r.current}</span>
        </div>
      );
    }

    function Shell() {
      return (
        <>
          <TitleView />
          <CountView />
          <button type="button" onClick={() => store.setState({ count: 1 })}>
            inc
          </button>
        </>
      );
    }

    render(<Shell />);
    expect(screen.getByTestId("title-renders").textContent).toBe("1");
    act(() => {
      screen.getByRole("button", { name: "inc" }).click();
    });
    expect(screen.getByTestId("count-renders").textContent).toBe("2");
    expect(screen.getByTestId("title-renders").textContent).toBe("1");
  });
});
