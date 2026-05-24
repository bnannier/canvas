import { CodeBlock } from "./code-block";
import type { ComponentExample } from "@/data/types";

interface ExampleCardProps {
  example: ComponentExample;
  compact?: boolean;
}

export function ExampleCard({ example, compact }: ExampleCardProps) {
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
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
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
        padding: "1.25rem",
        ...(example.full
          ? {}
          : {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 120,
              gap: "0.75rem",
              flexWrap: "wrap" as const,
            }),
      }}>
        <div dangerouslySetInnerHTML={{ __html: example.html }} />
      </div>
      <details style={{ marginTop: "0.5rem" }}>
        <summary style={{
          fontSize: "11.5px",
          color: "hsl(var(--muted-foreground))",
          cursor: "pointer",
          userSelect: "none",
        }}>
          Show code
        </summary>
        <div style={{ marginTop: "0.5rem" }}>
          <CodeBlock code={codeStr} language="html" />
        </div>
      </details>
    </div>
  );
}
