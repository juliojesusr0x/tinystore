import { useSyncExternalStore } from "react";
import type { Store } from "./createStore";

export function useStore<S extends object, Selected = S>(
  store: Store<S>,
  selector: (state: S) => Selected = (s) => s as unknown as Selected,
): Selected {
  return useSyncExternalStore(
    (onStoreChange) => store.subscribe(() => onStoreChange()),
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}
