import { useParams } from "react-router-dom";
import { getComponent } from "@/data/components";
import { ExampleCard } from "@/components/example-card";
import { Playground } from "@/components/playground";
import { PageNav } from "@/components/page-nav";
import { NotFound } from "./not-found";

export function ComponentPage() {
  const { slug } = useParams<{ slug: string }>();
  const comp = slug ? getComponent(slug) : undefined;

  if (!comp) return <NotFound />;

  return (
    <div>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.015em",
          color: "hsl(var(--foreground))",
        }}>
          {comp.name}
        </h1>
        <p style={{
          marginTop: 6,
          marginBottom: 0,
          fontSize: "13.5px",
          color: "hsl(var(--muted-foreground))",
          maxWidth: 640,
          lineHeight: 1.6,
        }}
          dangerouslySetInnerHTML={{ __html: comp.description }}
        />
      </header>

      {comp.playground && (
        <section style={{ marginBottom: "2.5rem" }}>
          <header style={{ marginBottom: "1rem" }}>
            <h2 style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-0.015em",
              color: "hsl(var(--foreground))",
            }}>
              Playground
            </h2>
            <p style={{
              marginTop: 4,
              marginBottom: 0,
              fontSize: "13.5px",
              color: "hsl(var(--muted-foreground))",
              maxWidth: 640,
              lineHeight: 1.6,
            }}>
              Combine variant, size, and state. The class string updates live: copy from the Markup field at the bottom right.
            </p>
          </header>
          <Playground config={comp.playground} />
        </section>
      )}

      {comp.sections.map((section, i) => (
        <section key={i} style={{ marginBottom: "2.5rem" }}>
          <header style={{ marginBottom: "1rem" }}>
            <h2 style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-0.015em",
              color: "hsl(var(--foreground))",
            }}>
              {section.title}
            </h2>
            {section.description && (
              <p style={{
                marginTop: 4,
                marginBottom: 0,
                fontSize: "13.5px",
                color: "hsl(var(--muted-foreground))",
                maxWidth: 640,
                lineHeight: 1.6,
              }}
                dangerouslySetInnerHTML={{ __html: section.description }}
              />
            )}
          </header>
          {section.anatomy && (
            <div style={{
              marginBottom: "1rem",
              padding: "0.75rem 1rem",
              borderRadius: 8,
              background: "hsl(var(--muted) / 0.4)",
              border: "1px solid hsl(var(--border))",
              fontSize: "12.5px",
              color: "hsl(var(--muted-foreground))",
            }}>
              <span style={{
                fontWeight: 600,
                color: "hsl(var(--foreground))",
                marginRight: 8,
              }}>
                Anatomy.
              </span>
              <span dangerouslySetInnerHTML={{ __html: section.anatomy }} />
            </div>
          )}
          {section.columns && section.columns > 1 ? (
            <div className={`section-col-grid cols-${section.columns}`}>
              {section.examples.map((ex, j) => (
                <ExampleCard key={j} example={ex} compact />
              ))}
            </div>
          ) : (
            section.examples.map((ex, j) => (
              <ExampleCard key={j} example={ex} />
            ))
          )}
        </section>
      ))}

      {comp.donts && comp.donts.length > 0 && (
        <section style={{ marginBottom: "2.5rem" }}>
          <header style={{ marginBottom: "1rem" }}>
            <h2 style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-0.015em",
              color: "hsl(var(--foreground))",
            }}>
              Don&rsquo;ts
            </h2>
          </header>
          <div className="donts-grid">
            {comp.donts.map((d, i) => (
              <div key={`dont-${i}`} style={{
                display: "contents",
              }}>
                <div style={{
                  borderRadius: 12,
                  border: "1px solid hsl(0 70% 60% / 0.3)",
                  background: "hsl(0 70% 60% / 0.05)",
                  padding: "1.25rem",
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "hsl(0 84% 60%)",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                    Don&rsquo;t
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}
                    dangerouslySetInnerHTML={{ __html: d.dont.html }} />
                  <p style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "hsl(var(--muted-foreground))",
                    lineHeight: 1.5,
                  }}>
                    {d.dont.caption}
                  </p>
                </div>
                <div style={{
                  borderRadius: 12,
                  border: "1px solid hsl(143 70% 45% / 0.3)",
                  background: "hsl(143 70% 45% / 0.05)",
                  padding: "1.25rem",
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "hsl(143 60% 38%)",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                    Do
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}
                    dangerouslySetInnerHTML={{ __html: d.do.html }} />
                  <p style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "hsl(var(--muted-foreground))",
                    lineHeight: 1.5,
                  }}>
                    {d.do.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <PageNav />
    </div>
  );
}
