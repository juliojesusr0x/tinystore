import { useEffect, useState } from "react";
import { createStore } from "../lib/createStore";
import { RenderCounter } from "./RenderCounter";

const counterStore = createStore({ count: 0 });

export function CounterDemo() {
  const [state, setState] = useState(counterStore.getState);

  useEffect(() => {
    return counterStore.subscribe(() => {
      setState(counterStore.getState());
    });
  }, []);

  return (
    <div className="demo-card">
      <h2>Counter (subscribe + useState)</h2>
      <p className="row">
        <span>count: {state.count}</span>
        <RenderCounter label="panel" />
      </p>
      <div className="row">
        <button
          type="button"
          onClick={() =>
            counterStore.setState((s) => ({ count: s.count + 1 }))
          }
        >
          +
        </button>
        <button
          type="button"
          onClick={() =>
            counterStore.setState((s) => ({ count: s.count - 1 }))
          }
        >
          −
        </button>
        <button type="button" onClick={() => counterStore.setState({ count: 0 })}>
          reset
        </button>
      </div>
      <p className="muted">
        Before <code>useStore</code>, wiring React to the store needs a bit of
        boilerplate.
      </p>
    </div>
  );
}
