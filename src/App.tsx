import { CounterDemo } from "./demo/CounterDemo";
import { ProfileDemo } from "./demo/ProfileDemo";
// import { debug } from "./lib/debug";
// import { profileStore } from "./demo/ProfileDemo";

// debug(profileStore, "profile");

export function App() {
  return (
    <>
      <h1>tinystore demo</h1>
      <div className="demo-grid">
        <CounterDemo />
        <ProfileDemo />
      </div>
    </>
  );
}
