import type { Store } from "./createStore";

/** logs every transition; returns unsubscribe */
export function debug<T extends object>(
  store: Store<T>,
  label = "store",
): () => void {
  return store.subscribe((next, prev) => {
    // eslint-disable-next-line no-console
    console.log(`[${label}]`, { prev, next });
  });
}
