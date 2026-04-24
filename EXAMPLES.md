# Examples

A collection of small, complete examples of how to use **tinystore**. The goal is to make the mental model obvious: one store, selectors for reads, `setState` for writes, subscriptions for side-effects.

All examples assume the alias from this repo:

```ts
import { createStore, useStore, shallow, debug } from "tinystore";
```

If you are using the library outside this repo, replace `"tinystore"` with the relative path to `src/lib/index.ts`.

---

## 1. Counter (the classic)

The smallest possible store. Good to check the hook is wired.

```tsx
import { createStore, useStore } from "tinystore";

const counterStore = createStore({ count: 0 });

function Counter() {
  const count = useStore(counterStore, (s) => s.count);

  return (
    <div>
      <p>count: {count}</p>
      <button onClick={() => counterStore.setState((s) => ({ count: s.count + 1 }))}>
        +1
      </button>
      <button onClick={() => counterStore.setState({ count: 0 })}>reset</button>
    </div>
  );
}
```

Notes:

- The selector `s => s.count` makes sure the component only re-renders when `count` changes, not when other fields change.
- The updater form `(s) => ({ count: s.count + 1 })` is useful when the next state depends on the previous one (same idea as `useState`).

---

## 2. Toggle (single boolean)

Same idea, even smaller. Shows that you do not need a selector for trivial states, but it is still a good habit.

```tsx
import { createStore, useStore } from "tinystore";

const modalStore = createStore({ open: false });

function Modal() {
  const open = useStore(modalStore, (s) => s.open);

  if (!open) return null;
  return (
    <div role="dialog">
      <p>Hello.</p>
      <button onClick={() => modalStore.setState({ open: false })}>close</button>
    </div>
  );
}

function OpenButton() {
  return (
    <button onClick={() => modalStore.setState({ open: true })}>
      open modal
    </button>
  );
}
```

---

## 3. Multiple fields, independent selectors

This is the most important pattern to understand. Each child component subscribes only to the slice it needs.

```tsx
import { createStore, useStore } from "tinystore";

const profileStore = createStore({
  name: "Ada",
  age: 36,
  email: "ada@example.com",
});

function NameView() {
  const name = useStore(profileStore, (s) => s.name);
  return <p>name: {name}</p>;
}

function AgeView() {
  const age = useStore(profileStore, (s) => s.age);
  return <p>age: {age}</p>;
}

function Controls() {
  return (
    <>
      <button onClick={() => profileStore.setState({ name: "Alan" })}>
        change name
      </button>
      <button onClick={() => profileStore.setState((s) => ({ age: s.age + 1 }))}>
        age +1
      </button>
    </>
  );
}
```

If you click "change name", only `NameView` re-renders. `AgeView` does not. That is the whole point of selector-based subscriptions.

---

## 4. Slice with `shallow` equality

Sometimes you want to read **several** fields at once. If you return a fresh object on each render, the component would re-render on every update, because `Object.is({a:1},{a:1})` is `false`. Use `shallow` as your equality function.

```tsx
import { createStore, useStore, shallow } from "tinystore";

const userStore = createStore({
  id: "u-1",
  name: "Ada",
  role: "admin",
  lastSeenAt: 0,
});

function UserCard() {
  const { name, role } = useStore(
    userStore,
    (s) => ({ name: s.name, role: s.role }),
    shallow,
  );

  return (
    <article>
      <h3>{name}</h3>
      <p>{role}</p>
    </article>
  );
}
```

When the store updates `lastSeenAt`, the selected object `{ name, role }` stays shallow-equal, so `UserCard` does not re-render.

---

## 5. Custom equality (deep compare, case-insensitive, etc.)

The third argument of `useStore` is just a function `(a, b) => boolean`. You can put anything there.

```tsx
import { createStore, useStore } from "tinystore";

const searchStore = createStore({ query: "" });

const caseInsensitive = (a: string, b: string) =>
  a.toLowerCase() === b.toLowerCase();

function Results() {
  const query = useStore(searchStore, (s) => s.query, caseInsensitive);
  return <p>searching: {query}</p>;
}
```

`Results` will not re-render when the user only changes the case of the query.

---

## 6. Todo list (add / toggle / remove)

Shows immutable list updates. The store only holds data, the UI is pure.

```tsx
import { createStore, useStore, shallow } from "tinystore";

type Todo = { id: string; text: string; done: boolean };

const todosStore = createStore<{ items: Todo[] }>({ items: [] });

function addTodo(text: string) {
  todosStore.setState((s) => ({
    items: [...s.items, { id: crypto.randomUUID(), text, done: false }],
  }));
}

function toggleTodo(id: string) {
  todosStore.setState((s) => ({
    items: s.items.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
  }));
}

function removeTodo(id: string) {
  todosStore.setState((s) => ({ items: s.items.filter((t) => t.id !== id) }));
}

function TodoList() {
  const items = useStore(todosStore, (s) => s.items);

  return (
    <ul>
      {items.map((t) => (
        <li key={t.id}>
          <label>
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => toggleTodo(t.id)}
            />
            {t.text}
          </label>
          <button onClick={() => removeTodo(t.id)}>x</button>
        </li>
      ))}
    </ul>
  );
}

function TodoCount() {
  const { total, open } = useStore(
    todosStore,
    (s) => ({
      total: s.items.length,
      open: s.items.filter((t) => !t.done).length,
    }),
    shallow,
  );

  return (
    <p>
      {open} open / {total} total
    </p>
  );
}
```

Two things are worth pointing out:

- `TodoList` re-renders when the `items` array reference changes. Because every update produces a new array, that is expected.
- `TodoCount` selects a derived object and uses `shallow` so it re-renders only when `total` or `open` actually change.

---

## 7. Actions in module scope (pattern)

You can keep your mutators next to the store, so components stay focused on rendering.

```ts
// cartStore.ts
import { createStore } from "tinystore";

type CartItem = { sku: string; qty: number };

export const cartStore = createStore<{ items: CartItem[] }>({ items: [] });

export const cartActions = {
  add(sku: string) {
    cartStore.setState((s) => {
      const existing = s.items.find((i) => i.sku === sku);
      if (existing) {
        return {
          items: s.items.map((i) =>
            i.sku === sku ? { ...i, qty: i.qty + 1 } : i,
          ),
        };
      }
      return { items: [...s.items, { sku, qty: 1 }] };
    });
  },
  remove(sku: string) {
    cartStore.setState((s) => ({
      items: s.items.filter((i) => i.sku !== sku),
    }));
  },
  clear() {
    cartStore.setState({ items: [] });
  },
};
```

```tsx
// Cart.tsx
import { useStore } from "tinystore";
import { cartStore, cartActions } from "./cartStore";

function CartBadge() {
  const count = useStore(cartStore, (s) =>
    s.items.reduce((a, i) => a + i.qty, 0),
  );
  return <span aria-label="cart items">{count}</span>;
}

function CartButtons() {
  return (
    <>
      <button onClick={() => cartActions.add("sku-1")}>add item</button>
      <button onClick={cartActions.clear}>clear</button>
    </>
  );
}
```

This gives you the feeling of a Redux-style "actions" layer without any framework cost.

---

## 8. Async state (fetch with loading/error/data)

tinystore does not have a built-in async layer. You just call `setState` at the right moments.

```ts
// usersStore.ts
import { createStore } from "tinystore";

type User = { id: string; name: string };

type UsersState = {
  status: "idle" | "loading" | "success" | "error";
  data: User[];
  error: string | null;
};

export const usersStore = createStore<UsersState>({
  status: "idle",
  data: [],
  error: null,
});

export async function loadUsers() {
  usersStore.setState({ status: "loading", error: null });
  try {
    const res = await fetch("/api/users");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as User[];
    usersStore.setState({ status: "success", data });
  } catch (e) {
    usersStore.setState({
      status: "error",
      error: e instanceof Error ? e.message : "unknown",
    });
  }
}
```

```tsx
// Users.tsx
import { useEffect } from "react";
import { useStore } from "tinystore";
import { usersStore, loadUsers } from "./usersStore";

function Users() {
  const { status, data, error } = useStore(usersStore);

  useEffect(() => {
    if (status === "idle") loadUsers();
  }, [status]);

  if (status === "loading") return <p>loading...</p>;
  if (status === "error") return <p>error: {error}</p>;
  return (
    <ul>
      {data.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

Notes:

- Calling `useStore(store)` with no selector returns the full state. For small stores this is fine; for big stores, always prefer a selector.
- In the `useEffect`, we read `status` from the store and dispatch `loadUsers` only when it is still `"idle"`. This avoids double fetches in `StrictMode`.

---

## 9. Multiple stores

There is no rule that says you must keep everything in one store. Often it is simpler to have several small stores and combine them at the component level.

```tsx
import { createStore, useStore } from "tinystore";

const authStore = createStore<{ user: { id: string; name: string } | null }>({
  user: null,
});

const themeStore = createStore<{ mode: "light" | "dark" }>({ mode: "light" });

function Header() {
  const user = useStore(authStore, (s) => s.user);
  const mode = useStore(themeStore, (s) => s.mode);

  return (
    <header data-theme={mode}>
      <span>{user ? `Hi, ${user.name}` : "Signed out"}</span>
      <button
        onClick={() =>
          themeStore.setState((s) => ({ mode: s.mode === "light" ? "dark" : "light" }))
        }
      >
        toggle theme
      </button>
    </header>
  );
}
```

If two unrelated parts of your app do not need to share state, do not force them into the same store.

---

## 10. Subscribe outside React (logger, localStorage persist)

`subscribe` is the generic escape hatch. You can use it without any React code.

```ts
import { createStore } from "tinystore";

const settingsStore = createStore({
  language: "en",
  notifications: true,
});

// 10.1 logger
const unsubLog = settingsStore.subscribe((next, prev) => {
  console.log("settings changed", { prev, next });
});

// 10.2 persist to localStorage
const KEY = "settings-v1";

const saved = localStorage.getItem(KEY);
if (saved) {
  try {
    settingsStore.setState(JSON.parse(saved));
  } catch {
    /* ignore bad cache */
  }
}

settingsStore.subscribe((next) => {
  localStorage.setItem(KEY, JSON.stringify(next));
});
```

The logger returns `unsubLog` so you can stop logging later. The persist subscription is intentionally kept forever.

---

## 11. Read current state without subscribing

Sometimes you only need the value once, for example inside an event handler. Use `getState`, not the hook.

```tsx
import { createStore, useStore } from "tinystore";

const formStore = createStore({ email: "", password: "" });

function setEmail(email: string) {
  formStore.setState({ email });
}

function setPassword(password: string) {
  formStore.setState({ password });
}

function submit() {
  // we don't need the component to re-render on every keystroke
  // to do this read
  const { email, password } = formStore.getState();
  fetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

function EmailField() {
  const email = useStore(formStore, (s) => s.email);
  return (
    <input
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      aria-label="email"
    />
  );
}
```

---

## 12. Derived values (computed outside React)

tinystore does not ship a `derive` helper on purpose. You can still compute derived data inside selectors, or keep a second store that listens to the first one.

```ts
import { createStore } from "tinystore";

const cartStore = createStore<{ items: { price: number; qty: number }[] }>({
  items: [],
});

const totalsStore = createStore({ subtotal: 0, tax: 0, total: 0 });

cartStore.subscribe((next) => {
  const subtotal = next.items.reduce((a, i) => a + i.price * i.qty, 0);
  const tax = subtotal * 0.1;
  totalsStore.setState({ subtotal, tax, total: subtotal + tax });
});
```

Now any component can `useStore(totalsStore, ...)` without recomputing on each render.

---

## 13. Debug helper

The library exposes a tiny `debug(store, label?)` that logs every transition with the `changed` keys. It is meant for local debugging.

```ts
import { createStore, debug } from "tinystore";

const settingsStore = createStore({
  language: "en",
  notifications: true,
});

if (import.meta.env.DEV) {
  debug(settingsStore, "settings");
}

settingsStore.setState({ language: "pt" });
// [settings] { prev: {...}, next: {...}, changed: ["language"] }
```

Remember to guard it behind `import.meta.env.DEV` (or similar) so it never runs in production.

---

## 14. Typing notes

Types are inferred from the initial state:

```ts
const store = createStore({ count: 0, name: "ada" });
//      ^? Store<{ count: number; name: string }>

store.setState({ count: 1 }); // ok
store.setState({ count: "1" }); // type error
store.setState((s) => ({ count: s.count + 1 })); // ok

const selector: (s: { count: number; name: string }) => number = (s) => s.count;

useStore(store, selector); // returns number
```

If your state needs optional fields or unions, it is often cleaner to write the type explicitly:

```ts
type User = { id: string; name: string } | null;
type AuthState = { user: User; token: string | null };

const authStore = createStore<AuthState>({ user: null, token: null });
```

---

## 15. Testing a store

Because the store has no React dependency, you can test it with plain Vitest.

```ts
import { describe, expect, it, vi } from "vitest";
import { createStore } from "tinystore";

describe("counter store", () => {
  it("increments", () => {
    const store = createStore({ count: 0 });
    store.setState((s) => ({ count: s.count + 1 }));
    expect(store.getState().count).toBe(1);
  });

  it("notifies subscribers once per setState", () => {
    const store = createStore({ n: 0 });
    const spy = vi.fn();
    store.subscribe(spy);
    store.setState({ n: 1 });
    store.setState({ n: 2 });
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
```

For React-side tests, use `@testing-library/react` and assert on render counts (see `src/tests/useStore.test.tsx` in this repo).

---

## When not to use tinystore

Short list, to be honest:

- You need time travel, devtools, or complex action pipelines. Use Redux Toolkit.
- You need a battle-tested, team-friendly API with a big ecosystem. Use Zustand.
- You need server state caching, retries, dedupe, background refetch. Use TanStack Query or similar.
- Your state is local to one component. Use `useState`. Really.
