import { useState } from "react";
import { CodeBlock } from "./code-block";
import { Code, ChevronDown } from "lucide-react";
import type { ComponentExample } from "@/data/types";

interface ExampleCardProps {
  example: ComponentExample;
  compact?: boolean;
}

export function ExampleCard({ example, compact }: ExampleCardProps) {
  const [open, setOpen] = useState(false);
  const codeStr = example.code ?? example.html;

  if (compact) {
    return (
      <div className="section-card" style={{
        padding: "1.25rem",
        ...(example.full
          ? {}
          : { minHeight: 80 }),
      }}>
        {example.label && (
          <div style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "hsl(var(--muted-foreground))",
            fontWeight: 500,
            marginBottom: "0.75rem",
          }}>
            {example.label}
          </div>
        )}
        <div
          className="example-inner"
          dangerouslySetInnerHTML={{ __html: example.html }}
        />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "1rem" }}>
      {example.label && (
        <div style={{
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "hsl(var(--muted-foreground))",
          fontWeight: 500,
          marginBottom: "0.5rem",
        }}>
          {example.label}
        </div>
      )}
      <div className="section-card" style={{
        overflow: "hidden",
      }}>
        <div style={{
          padding: "1.25rem",
          ...(example.full
            ? {}
            : {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 120,
              }),
        }}>
          <div
            className="example-inner"
            style={example.full ? undefined : { justifyContent: "center" }}
            dangerouslySetInnerHTML={{ __html: example.html }}
          />
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="docs-code-toggle"
          aria-expanded={open}
        >
          <Code size={13} />
          <span>{open ? "Hide code" : "Show code"}</span>
          <ChevronDown
            size={13}
            style={{
              marginLeft: "auto",
              transition: "transform 200ms ease",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </button>

        <div className={`docs-code-collapse ${open ? "open" : ""}`}>
          <div style={{ minHeight: 0, overflow: "hidden" }}>
            <CodeBlock code={codeStr} language="html" />
          </div>
        </div>
      </div>
    </div>
  );
}
