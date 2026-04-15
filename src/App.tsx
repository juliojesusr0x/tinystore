import { CounterDemo } from "./demo/CounterDemo";
import { ProfileDemo } from "./demo/ProfileDemo";

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
