import { useState } from "react";
import { CodeBlock } from "./code-block";
import { PlatformPreview } from "./live-example";

export interface Variant {
  label: string;
  code: string;
}

// The Variants section as one playground: a single 3-platform preview whose
// variant is chosen from the toggle rail on the right. Replaces the old stack of
// one full 3-column stage per variant (Button has 6, Typography 12). The preview
// and its code remount on switch (key=selected) so a variant that opens an overlay
// re-runs cleanly and never leaks state across variants.
export function VariantsPlayground({ variants }: { variants: Variant[] }) {
  const [selected, setSelected] = useState(0);
  const sel = variants[selected] ?? variants[0];

  return (
    <div className="variants-playground playground-grid">
      <div className="live-example" key={selected}>
        <PlatformPreview code={sel.code} />
        <CodeBlock code={sel.code} language="tsx" />
      </div>
      <div className="variant-rail" role="tablist" aria-label="Variants">
        {variants.map((v, i) => (
          <button
            key={v.label}
            role="tab"
            aria-selected={i === selected}
            className={i === selected ? "active" : ""}
            onClick={() => setSelected(i)}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
