import { createStore } from "../lib/createStore";
import { useStore } from "../lib/useStore";
import { RenderCounter } from "./RenderCounter";

const counterStore = createStore({ count: 0 });

export function CounterDemo() {
  const state = useStore(counterStore);

  return (
    <div className="demo-card">
      <h2>Counter (useSyncExternalStore)</h2>
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
        Same store, but the component subscribes through{" "}
        <code>useSyncExternalStore</code>.
      </p>
    </div>
  );
}
