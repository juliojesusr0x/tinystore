import { useRef } from "react";

type Props = { label?: string };

export function RenderCounter({ label = "renders" }: Props) {
  const n = useRef(0);
  n.current += 1;
  return (
    <span className="render-badge" title="Times this component rendered">
      {label}: {n.current}
    </span>
  );
}
