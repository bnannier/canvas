import { CodeBlock } from "./code-block";
import type { ComponentExample } from "@/data/types";

interface ExampleCardProps {
  example: ComponentExample;
}

export function ExampleCard({ example }: ExampleCardProps) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      {example.title && (
        <div style={{
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "hsl(var(--muted-foreground))",
          fontWeight: 500,
          marginBottom: "0.5rem",
        }}>
          {example.title}
        </div>
      )}
      {example.description && (
        <p className="small muted" style={{ marginBottom: "0.5rem" }}>{example.description}</p>
      )}
      <div className="section-card" style={{
        padding: "1.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 120,
        gap: "0.75rem",
        flexWrap: "wrap",
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
          <CodeBlock code={example.html} language="html" />
        </div>
      </details>
    </div>
  );
}
