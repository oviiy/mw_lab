import type { ReactNode } from "react";
import { useActiveStep } from "../lib/hooks";

interface Props {
  /** Prose for each step; trusted HTML authored in src/story. */
  steps: string[];
  children: (active: number) => ReactNode;
}

/** Text scrolls on the left; the graphic stays pinned and reacts to the active step. */
export default function Scrolly({ steps, children }: Props) {
  const [active, bind] = useActiveStep(steps.length);
  return (
    <div className="scrolly">
      <div className="scrolly-graphic">{children(active)}</div>
      <div className="scrolly-steps">
        {steps.map((html, i) => (
          <div
            key={i}
            ref={bind(i)}
            data-step={i}
            className={`step${i === active ? " is-active" : ""}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ))}
      </div>
    </div>
  );
}
