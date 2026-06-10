import { useParams } from "react-router-dom";
import { getComponent } from "@/data/components";
import { Markdown } from "@/components/markdown";
import { LiveExample } from "@/components/live-example";
import { PageNav } from "@/components/page-nav";
import { NotFound } from "./not-found";

// Each component page renders straight from its co-located markdown
// (src/<level>/<slug>/<slug>.md), so editing the .md changes the page. The whole
// `src/` tree of `.md` is inlined as raw strings at build time and HMR-tracked, so
// a saved edit re-renders. The head (Usage + Variants) renders through
// <Markdown live>; the Do/Don't section is parsed into the red/green cards below,
// each side rendered live.
const RAW = import.meta.glob("../../../src/*/*/*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const LEVEL: Record<string, string> = { Atoms: "atoms", Molecules: "molecules", Organisms: "organisms" };

type DontSide = { caption: string; code: string };
type DontPair = { title?: string; do: DontSide; dont: DontSide };

// Split the raw .md into the head (everything before "## Do & Don't", with the
// leading "# Name" + description dropped since the page header already shows them)
// and the parsed Do/Don't pairs.
function splitDoc(src: string): { head: string; donts: DontPair[] } {
  const md = src.replace(/\r\n/g, "\n");
  const dontsAt = md.indexOf("\n## Do & Don't");
  const body = dontsAt === -1 ? md : md.slice(0, dontsAt);
  const section = dontsAt === -1 ? "" : md.slice(dontsAt);
  // Head begins at the first "## " (Usage), dropping the "# Name" + description.
  const firstSection = body.indexOf("\n## ");
  const head = firstSection === -1 ? "" : body.slice(firstSection + 1);
  return { head, donts: parseDonts(section) };
}

// The Do/Don't markdown is regular: "### title" groups, each with "**Do** — caption"
// + a ```tsx fence and "**Don't** — caption" + a ```tsx fence (Do emitted first).
// Pair by marker name, not position, so order does not matter.
function parseDonts(section: string): DontPair[] {
  const lines = section.split("\n");
  const pairs: DontPair[] = [];
  let title: string | undefined;
  let cur: { do?: DontSide; dont?: DontSide } = {};
  let side: "do" | "dont" | null = null;
  let caption = "";
  for (let i = 0; i < lines.length; i++) {
    const h = /^###\s+(.*)$/.exec(lines[i]);
    if (h) { title = h[1].trim(); cur = {}; side = null; continue; }
    const m = /^\*\*(Do|Don['’]t)\*\*\s*(.*)$/.exec(lines[i]);
    if (m) {
      side = m[1] === "Do" ? "do" : "dont";
      // Strip the leading separator (an em/en dash, colon, or hyphen) + spaces.
      caption = m[2].replace(/^[\s\p{P}]+/u, "").trim();
      continue;
    }
    if (/^```(\w+)?\s*$/.test(lines[i]) && side) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) code.push(lines[i++]);
      cur[side] = { caption, code: code.join("\n") };
      side = null;
      if (cur.do && cur.dont) { pairs.push({ title, do: cur.do, dont: cur.dont }); cur = {}; }
    }
  }
  return pairs;
}

export function ComponentPage() {
  const { slug } = useParams<{ slug: string }>();
  const comp = slug ? getComponent(slug) : undefined;

  if (!comp) return <NotFound />;

  const src = RAW[`../../../src/${LEVEL[comp.category]}/${comp.slug}/${comp.slug}.md`];
  const { head, donts } = src ? splitDoc(src) : { head: "", donts: [] as DontPair[] };

  return (
    <div>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.015em",
          color: "var(--foreground)",
        }}>
          {comp.name}
        </h1>
        <p style={{
          marginTop: 6,
          marginBottom: 0,
          fontSize: "13.5px",
          color: "var(--muted-foreground)",
          maxWidth: 640,
          lineHeight: 1.6,
        }}
          dangerouslySetInnerHTML={{ __html: comp.description }}
        />
      </header>

      {head && (
        <section style={{ marginBottom: "2.5rem" }}>
          <Markdown source={head} live />
        </section>
      )}

      {donts.length > 0 && (
        <section style={{ marginBottom: "2.5rem" }}>
          <header style={{ marginBottom: "1rem" }}>
            <h2 style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-0.015em",
              color: "var(--foreground)",
            }}>
              Don&rsquo;ts
            </h2>
          </header>
          <div className="donts-grid">
            {donts.map((d, i) => (
              <div key={`dont-${i}`} style={{
                display: "contents",
              }}>
                {d.title && (
                  <div style={{
                    gridColumn: "1 / -1",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    marginTop: i > 0 ? "0.75rem" : 0,
                  }}>
                    {d.title}
                  </div>
                )}
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
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                    <LiveExample code={d.dont.code} />
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "var(--muted-foreground)",
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
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                    <LiveExample code={d.do.code} />
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "var(--muted-foreground)",
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
