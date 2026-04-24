import type { Store } from "./createStore";

function changedKeys<T extends object>(prev: T, next: T): (keyof T)[] {
  const keys = new Set([
    ...Reflect.ownKeys(prev),
    ...Reflect.ownKeys(next),
  ] as (keyof T)[]);
  const out: (keyof T)[] = [];
  for (const k of keys) {
    if (!Object.is(next[k], prev[k])) {
      out.push(k);
    }
  }
  return out;
}

/** logs prev / next / changed keys; returns unsubscribe */
export function debug<T extends object>(
  store: Store<T>,
  label = "store",
): () => void {
  return store.subscribe((next, prev) => {
    const changed = changedKeys(prev, next);
    console.log(`[${label}]`, { prev, next, changed });
  });
}
