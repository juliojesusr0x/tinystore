import { useRef, useSyncExternalStore } from "react";
import type { Store } from "./createStore";

export function useStore<S extends object, Selected = S>(
  store: Store<S>,
  selector: (state: S) => Selected = (s) => s as unknown as Selected,
): Selected {
  const cache = useRef<{ state: S; selected: Selected } | null>(null);

  const getSnapshot = (): Selected => {
    const state = store.getState();
    const c = cache.current;
    if (c !== null && c.state === state) {
      return c.selected;
    }

    const selected = selector(state);
    if (c !== null && Object.is(c.selected, selected)) {
      cache.current = { state, selected: c.selected };
      return c.selected;
    }

    cache.current = { state, selected };
    return selected;
  };

  return useSyncExternalStore(
    (onStoreChange) => store.subscribe(() => onStoreChange()),
    getSnapshot,
    getSnapshot,
  );
}
