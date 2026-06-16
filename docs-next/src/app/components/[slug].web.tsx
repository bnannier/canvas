import { useParams } from "react-router-dom";
import { getComponent } from "@/data/components";
import { LiveExample } from "@/components/live-example";
import { Playground } from "@/components/playground";
import { PageNav } from "@/components/page-nav";
import { NotFound } from "@/pages/not-found";
import { COMPONENT_DOCS } from "docs-core/registry";

// Web component page. The Vite original parses each component's `.md` at build with
// import.meta.glob (Vite-only); here the same examples + Do/Don't pairs come from the
// generated docs-core registry instead, but the rendered markup, classNames, and the
// reused Playground / LiveExample are identical — so the page looks exactly the same.
export default function ComponentPageWeb() {
  const { slug } = useParams<{ slug: string }>();
  const comp = slug ? getComponent(slug) : undefined;
  if (!comp) return <NotFound />;

  const entry = COMPONENT_DOCS[comp.dir ?? comp.slug];
  const examples = entry ? entry.examples.map((e) => ({ label: e.label, code: e.code })) : [];
  const donts = entry
    ? entry.donts.map((d) => ({
        title: d.title,
        do: { caption: d.do.caption, code: d.do.code },
        dont: { caption: d.dont.caption, code: d.dont.code },
      }))
    : [];

  return (
    <div>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.015em", color: "var(--foreground)" }}>
          {comp.name}
        </h1>
        <p
          style={{ marginTop: 6, marginBottom: 0, fontSize: "13.5px", color: "var(--muted-foreground)", maxWidth: 640, lineHeight: 1.6 }}
          dangerouslySetInnerHTML={{ __html: comp.description }}
        />
      </header>

      {examples.length > 0 && (
        <section style={{ marginBottom: "2.5rem" }}>
          <Playground key={comp.slug} examples={examples} />
        </section>
      )}

      {donts.length > 0 && (
        <section style={{ marginBottom: "2.5rem" }}>
          <header style={{ marginBottom: "1rem" }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: "-0.015em", color: "var(--foreground)" }}>
              Don&rsquo;ts
            </h2>
          </header>
          <div className="donts-grid">
            {donts.map((d, i) => (
              <div key={`dont-${i}`} style={{ display: "contents" }}>
                {d.title && (
                  <div style={{ gridColumn: "1 / -1", fontSize: "13px", fontWeight: 600, color: "var(--foreground)", marginTop: i > 0 ? "0.75rem" : 0 }}>
                    {d.title}
                  </div>
                )}
                <div style={{ borderRadius: 12, border: "1px solid hsl(0 70% 60% / 0.3)", background: "hsl(0 70% 60% / 0.05)", padding: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px", fontWeight: 600, marginBottom: "0.5rem", color: "hsl(0 84% 60%)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                    Don&rsquo;t
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                    <LiveExample code={d.dont.code} />
                  </div>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--muted-foreground)", lineHeight: 1.5 }}>{d.dont.caption}</p>
                </div>
                <div style={{ borderRadius: 12, border: "1px solid hsl(143 70% 45% / 0.3)", background: "hsl(143 70% 45% / 0.05)", padding: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "13px", fontWeight: 600, marginBottom: "0.5rem", color: "hsl(143 60% 38%)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                    Do
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                    <LiveExample code={d.do.code} />
                  </div>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--muted-foreground)", lineHeight: 1.5 }}>{d.do.caption}</p>
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
