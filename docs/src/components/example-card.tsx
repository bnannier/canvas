import { useState } from "react";
import { CodeBlock } from "./code-block";
import type { ComponentExample } from "@/data/types";

interface ExampleCardProps {
  example: ComponentExample;
}

export function ExampleCard({ example }: ExampleCardProps) {
  const [tab, setTab] = useState<"preview" | "code">("preview");

  return (
    <div>
      {example.title && (
        <h3 className="h5" style={{ marginBottom: "0.5rem" }}>{example.title}</h3>
      )}
      {example.description && (
        <p className="small muted" style={{ marginBottom: "0.5rem" }}>{example.description}</p>
      )}
      <div style={{ border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-lg, 12px)", overflow: "hidden" }}>
        <div className="docs-example-tabs">
          <button
            className={`docs-example-tab${tab === "preview" ? " active" : ""}`}
            onClick={() => setTab("preview")}
          >
            Preview
          </button>
          <button
            className={`docs-example-tab${tab === "code" ? " active" : ""}`}
            onClick={() => setTab("code")}
          >
            Code
          </button>
        </div>
        {tab === "preview" ? (
          <div className="docs-preview" style={{ borderTop: "none", borderRadius: 0, border: "none" }}>
            <div dangerouslySetInnerHTML={{ __html: example.html }} />
          </div>
        ) : (
          <div style={{ borderRadius: 0 }}>
            <CodeBlock code={example.html} language="html" />
          </div>
        )}
      </div>
    </div>
  );
}
