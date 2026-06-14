import { useState } from "react";
import { CodeBlock } from "./code-block";
import { PlatformPreview } from "./live-example";

export interface Example {
  label: string;
  code: string;
}

// The single component playground: one iOS / Android / Web preview plus its code,
// with a right-side rail to switch examples (Default usage first, then variants).
// Clicking an example swaps all three platform columns and the code at once. The
// preview/code remount on switch (key=selected) so an example that opens an overlay
// re-runs cleanly and never leaks state across examples. With only one example
// (components without a Variants section) the rail is dropped and the preview runs
// full width.
export function Playground({ examples }: { examples: Example[] }) {
  const [selected, setSelected] = useState(0);
  const sel = examples[selected] ?? examples[0];
  if (!sel) return null;

  const body = (
    <div className="live-example" key={selected}>
      <PlatformPreview code={sel.code} />
      <CodeBlock code={sel.code} language="tsx" />
    </div>
  );

  if (examples.length === 1) {
    return <div className="component-playground">{body}</div>;
  }

  return (
    <div className="component-playground playground-grid">
      {body}
      <div className="variant-rail" role="tablist" aria-label="Examples">
        {examples.map((e, i) => (
          <button
            key={e.label}
            role="tab"
            aria-selected={i === selected}
            className={i === selected ? "active" : ""}
            onClick={() => setSelected(i)}
          >
            {e.label}
          </button>
        ))}
      </div>
    </div>
  );
}
