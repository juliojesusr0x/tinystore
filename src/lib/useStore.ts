import { useSyncExternalStore } from "react";
import type { Store } from "./createStore";

/** wip — selector not here yet */
export function useStore<S extends object>(store: Store<S>): S {
  return useSyncExternalStore(
    (onStoreChange) => store.subscribe(() => onStoreChange()),
    () => store.getState(),
    () => store.getState(),
  );
}
