import { createStore } from "../lib/createStore";
import { useStore } from "../lib/useStore";
import { RenderCounter } from "./RenderCounter";

export const profileStore = createStore({
  name: "Ada",
  age: 36,
  email: "ada@example.com",
});

function NameLine() {
  const name = useStore(profileStore, (s) => s.name);
  return (
    <p className="row">
      <span>
        name: <strong>{name}</strong>
      </span>
      <RenderCounter label="name line" />
    </p>
  );
}

function AgeLine() {
  const age = useStore(profileStore, (s) => s.age);
  return (
    <p className="row">
      <span>
        age: <strong>{age}</strong>
      </span>
      <RenderCounter label="age line" />
    </p>
  );
}

function NameField() {
  const name = useStore(profileStore, (s) => s.name);
  return (
    <label className="muted row">
      name
      <input
        type="text"
        value={name}
        onChange={(e) => profileStore.setState({ name: e.target.value })}
        aria-label="name"
      />
    </label>
  );
}

function AgeField() {
  const age = useStore(profileStore, (s) => s.age);
  return (
    <label className="muted row">
      age
      <input
        type="number"
        value={age}
        onChange={(e) =>
          profileStore.setState({ age: Number(e.target.value) || 0 })
        }
        aria-label="age"
      />
    </label>
  );
}

export function ProfileDemo() {
  const email = useStore(profileStore, (s) => s.email);

  return (
    <div className="demo-card">
      <h2>Profile (selectors)</h2>
      <NameLine />
      <AgeLine />
      <label
        className="row"
        style={{ flexDirection: "column", alignItems: "stretch" }}
      >
        <span className="muted">email</span>
        <input
          type="text"
          value={email}
          onChange={(e) => profileStore.setState({ email: e.target.value })}
          aria-label="email"
        />
      </label>
      <div className="row" style={{ marginTop: "0.5rem", flexDirection: "column" }}>
        <NameField />
        <AgeField />
      </div>
      <p className="muted">
        Change <strong>name</strong>: the <em>age line</em> render badge should stay
        the same.
      </p>
    </div>
  );
}
