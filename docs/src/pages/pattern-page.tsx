import { useParams, Navigate } from "react-router-dom";
import { getPattern } from "@/data/patterns";

export function PatternPage() {
  const { slug } = useParams<{ slug: string }>();
  const pat = slug ? getPattern(slug) : undefined;

  if (!pat) return <Navigate to="/" replace />;

  return (
    <div style={{ maxWidth: 960 }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="h2" style={{ marginBottom: "0.5rem" }}>{pat.name}</h1>
        <p className="body" style={{ color: "hsl(var(--muted-foreground))", maxWidth: 640 }}>
          {pat.description}
        </p>
      </div>

      {pat.sections.map((section, i) => (
        <div key={i} className="docs-section" style={{ marginBottom: "2.5rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>{section.title}</h2>

          {section.description && (
            <p className="body-sm" style={{ color: "hsl(var(--muted-foreground))", marginBottom: "1rem", maxWidth: 640 }}>
              {section.description}
            </p>
          )}

          {section.anatomy && (
            <div style={{
              padding: "0.625rem 1rem",
              borderRadius: "var(--radius-md, 8px)",
              background: "hsl(var(--muted) / 0.3)",
              border: "1px solid hsl(var(--border))",
              fontSize: "12.5px",
              color: "hsl(var(--muted-foreground))",
              marginBottom: "1rem",
            }}>
              <span style={{ fontWeight: 600, color: "hsl(var(--foreground))", marginRight: 8 }}>Anatomy.</span>
              {section.anatomy}
            </div>
          )}

          <div className="section-card" style={{ padding: "1.5rem", overflow: "auto" }}>
            <div dangerouslySetInnerHTML={{ __html: section.html }} />
          </div>
        </div>
      ))}
    </div>
  );
}
