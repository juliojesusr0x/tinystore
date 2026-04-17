export type Listener<T> = (next: T, prev: T) => void;

/** not sure if exporting this is useful — kept for typing experiments */
export type SetStateArg<T extends object> =
  | Partial<T>
  | ((current: T) => Partial<T>);

export type Store<T extends object> = {
  getState: () => T;
  setState: (arg: SetStateArg<T>) => void;
  subscribe: (listener: Listener<T>) => () => void;
};

export function createStore<T extends object>(initialState: T): Store<T> {
  let state: T = { ...initialState };
  const listeners = new Set<Listener<T>>();

  function notify(next: T, prev: T) {
    for (const fn of listeners) {
      fn(next, prev);
    }
  }

  return {
    getState(): T {
      return state;
    },
    setState(arg: SetStateArg<T>): void {
      const patch = typeof arg === "function" ? arg(state) : arg;
      const prev = state;
      state = { ...state, ...patch };
      notify(state, prev);
    },
    subscribe(listener: Listener<T>): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
