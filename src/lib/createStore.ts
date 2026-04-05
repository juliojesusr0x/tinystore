/** first draft — listener type does not match what we pass in notify() */
type Listener<T> = () => void;

export function createStore<T extends object>(initialState: T) {
  let state = initialState;
  const listeners = new Set<Listener<T>>();

  function notify() {
    for (const fn of listeners) {
      fn();
    }
  }

  return {
    getState(): T {
      return state;
    },
    setState(
      partialOrUpdater: Partial<T> | ((current: T) => Partial<T>),
    ): void {
      const patch =
        typeof partialOrUpdater === "function"
          ? partialOrUpdater(state)
          : partialOrUpdater;
      const prev = state;
      state = { ...state, ...patch };
      notify();
    },
    subscribe(listener: Listener<T>): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
