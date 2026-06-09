import { PageNav } from "@/components/page-nav";

// The Canvas type scale is the Typography component's roles. Each row mirrors a
// role's Tailwind class set from src/components/typography.tsx (text-5xl down to
// text-xs), so the preview reflects the real package sizes rather than the docs
// site's own heading chrome.
const SCALE = [
  { name: "Display", role: "display", spec: "48 / 48 · bold", fontSize: 48, lineHeight: 48, weight: 700, tracking: "-0.025em", use: "Hero titles. One per screen, at most." },
  { name: "H1", role: "h1", spec: "36 / 40 · bold", fontSize: 36, lineHeight: 40, weight: 700, tracking: "-0.025em", use: "Top-level page titles." },
  { name: "H2", role: "h2", spec: "30 / 36 · semibold", fontSize: 30, lineHeight: 36, weight: 600, tracking: "-0.02em", use: "Major page sections." },
  { name: "H3", role: "h3", spec: "24 / 32 · semibold", fontSize: 24, lineHeight: 32, weight: 600, tracking: "-0.02em", use: "Subsections; in-app page titles." },
  { name: "H4", role: "h4", spec: "20 / 28 · semibold", fontSize: 20, lineHeight: 28, weight: 600, tracking: "-0.015em", use: "Card titles, dialog headings." },
  { name: "H5", role: "h5", spec: "18 / 28 · semibold", fontSize: 18, lineHeight: 28, weight: 600, tracking: "0", use: "Subgroup headers, form section labels." },
  { name: "Body", role: "body", spec: "14 / 1.6 · regular", fontSize: 14, lineHeight: 22, weight: 400, tracking: "0", use: "Default reading text." },
  { name: "Small", role: "small", spec: "14 / 20 · muted", fontSize: 14, lineHeight: 20, weight: 400, tracking: "0", muted: true, use: "Secondary text, helpers." },
  { name: "Tiny", role: "tiny", spec: "12 / 16 · muted", fontSize: 12, lineHeight: 16, weight: 400, tracking: "0", muted: true, use: "Metadata, timestamps, labels." },
];

const WEIGHTS = [
  { w: 400, name: "Regular", use: "Body text" },
  { w: 500, name: "Medium", use: "Labels, table values, buttons" },
  { w: 600, name: "Semibold", use: "Headings, card titles" },
  { w: 700, name: "Bold", use: "Display / hero text only" },
];

function Section({ title, description, anatomy, children }: {
  title: string;
  description?: string;
  anatomy?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <header style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600, letterSpacing: "-0.015em", color: "var(--foreground)" }}>
          {title}
        </h2>
        {description && (
          <p style={{ marginTop: 4, marginBottom: 0, fontSize: "13.5px", color: "var(--muted-foreground)", maxWidth: 640, lineHeight: 1.6 }}>
            {description}
          </p>
        )}
      </header>
      {anatomy && (
        <div style={{
          marginBottom: 16,
          padding: "12px 16px",
          borderRadius: "var(--radius-lg, 8px)",
          background: "color-mix(in oklch, var(--muted) 40%, transparent)",
          border: "1px solid var(--border)",
          fontSize: "12.5px",
          color: "var(--muted-foreground)",
        }}>
          <span style={{ fontWeight: 600, color: "var(--foreground)", marginRight: 8 }}>Anatomy.</span>
          {anatomy}
        </div>
      )}
      {children}
    </section>
  );
}

export function TypographyPage() {
  return (
    <div>
      <section style={{ marginBottom: 32 }}>
        <h1 style={{
          margin: 0,
          fontSize: "clamp(32px, 5vw, 40px)",
          fontWeight: 700,
          letterSpacing: "-0.025em",
          color: "var(--foreground)",
        }}>
          Typography
        </h1>
        <p style={{
          marginTop: 12,
          maxWidth: "42rem",
          fontSize: "14.5px",
          lineHeight: 1.6,
          color: "var(--muted-foreground)",
        }}>
          Two families do all the work. Geist Sans for prose and chrome; Geist Mono for code,
          IDs, timestamps, and any value the user might copy. The scale runs display down to tiny as
          boolean roles on the <code style={{ fontFamily: "var(--font-mono)" }}>Typography</code> component; helper
          roles (muted, caption, code, mono) cover the rest.
        </p>
      </section>

      <Section
        title="Font families"
        description="Two families, both self-hosted variable fonts. Upright only (no italics); one woff2 per family carries the full 100-900 weight range, so the network footprint stays honest."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          <div style={{
            borderRadius: "var(--radius-xl, 12px)",
            border: "1px solid var(--border)",
            background: "var(--card)",
            padding: 24,
          }}>
            <div style={{
              fontSize: "11px",
              textTransform: "uppercase" as const,
              letterSpacing: "0.08em",
              color: "var(--muted-foreground)",
              fontWeight: 500,
              marginBottom: 8,
            }}>
              --font-sans
            </div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 40, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em" }}>
              Geist
            </div>
            <div style={{ marginTop: 8, fontSize: "12.5px", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>
              "Geist", ui-sans-serif, system-ui, ...
            </div>
            <div style={{ marginTop: 16, fontSize: "14px", color: "var(--foreground)", lineHeight: 1.6 }}>
              The quick brown fox jumps over the lazy dog 0123456789
            </div>
            <div style={{ marginTop: 12, fontSize: "12px", color: "var(--muted-foreground)" }}>
              Self-hosted variable font · weight 100-900.
            </div>
          </div>
          <div style={{
            borderRadius: "var(--radius-xl, 12px)",
            border: "1px solid var(--border)",
            background: "var(--card)",
            padding: 24,
          }}>
            <div style={{
              fontSize: "11px",
              textTransform: "uppercase" as const,
              letterSpacing: "0.08em",
              color: "var(--muted-foreground)",
              fontWeight: 500,
              marginBottom: 8,
            }}>
              --font-mono
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 40, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.01em" }}>
              Geist Mono
            </div>
            <div style={{ marginTop: 8, fontSize: "12.5px", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>
              "Geist Mono", ui-monospace, monospace
            </div>
            <div style={{ marginTop: 16, fontSize: "14px", color: "var(--foreground)", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
              const id = "01HZ73K..." // copy-friendly digits
            </div>
            <div style={{ marginTop: 12, fontSize: "12px", color: "var(--muted-foreground)" }}>
              Self-hosted variable font · weight 100-900.
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Type scale"
        description="Each role pairs a size with a line-height. Select one with a boolean prop on Typography (e.g. <Typography h2>), never a raw font-size."
        anatomy="display and h1 are distinct roles (text-5xl vs text-4xl), not a shared rule; h3 doubles as the in-app page title. Roles are mutually exclusive, first-match precedence."
      >
        <div style={{
          borderRadius: "var(--radius-xl, 12px)",
          border: "1px solid var(--border)",
          background: "var(--card)",
          overflow: "hidden",
        }}>
          {SCALE.map((s, i) => (
            <div key={s.role} style={{
              display: "flex",
              alignItems: "baseline",
              gap: 24,
              padding: "16px 20px",
              borderTop: i ? "1px solid var(--border)" : undefined,
            }}>
              <div style={{ width: 140, flexShrink: 0 }}>
                <div style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--foreground)" }}>{s.name}</div>
                <code style={{ fontSize: "11px", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>{s.role}</code>
              </div>
              <div style={{
                flex: 1,
                fontSize: s.fontSize,
                lineHeight: `${s.lineHeight}px`,
                fontWeight: s.weight,
                letterSpacing: s.tracking,
                color: s.muted ? "var(--muted-foreground)" : "var(--foreground)",
              }}>
                Sphinx of black quartz, judge my vow.
              </div>
              <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--muted-foreground)", textAlign: "right" as const, width: 160 }}>
                {s.spec}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, fontSize: "12.5px", color: "var(--muted-foreground)" }}>
          {SCALE.map((s) => (
            <div key={s.role} style={{ display: "flex", gap: 8 }}>
              <code style={{ color: "var(--foreground)", fontFamily: "var(--font-mono)" }}>{s.role}</code>
              <span>· {s.use}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Weights" description="Variable axis; every integer 100-900 is available but we use four.">
        <div style={{
          borderRadius: "var(--radius-xl, 12px)",
          border: "1px solid var(--border)",
          background: "var(--card)",
          overflow: "hidden",
        }}>
          {WEIGHTS.map((w, i) => (
            <div key={w.w} style={{
              display: "flex",
              alignItems: "baseline",
              gap: 24,
              padding: "12px 20px",
              borderTop: i ? "1px solid var(--border)" : undefined,
            }}>
              <div style={{ width: 100, flexShrink: 0, fontSize: "12.5px", fontWeight: 500, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>
                {w.w}
              </div>
              <div style={{ flex: 1, fontSize: 20, fontWeight: w.w }}>{w.name}</div>
              <div style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>{w.use}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Patterns in use">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          <div style={{
            borderRadius: "var(--radius-xl, 12px)",
            border: "1px solid var(--border)",
            background: "var(--card)",
            padding: 20,
          }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--muted-foreground)", fontWeight: 500, marginBottom: 8 }}>
              Page header
            </div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--foreground)" }}>Identities</h1>
            <div style={{ marginTop: 4, fontSize: "14px", color: "var(--muted-foreground)" }}>
              Manage user identities in your identity service
            </div>
          </div>
          <div style={{
            borderRadius: "var(--radius-xl, 12px)",
            border: "1px solid var(--border)",
            background: "var(--card)",
            padding: 20,
          }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--muted-foreground)", fontWeight: 500, marginBottom: 8 }}>
              Stat card
            </div>
            <div style={{ fontSize: "13px", color: "var(--muted-foreground)", fontWeight: 500 }}>Active sessions</div>
            <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4 }}>1,204</div>
          </div>
          <div style={{
            borderRadius: "var(--radius-xl, 12px)",
            border: "1px solid var(--border)",
            background: "var(--card)",
            padding: 20,
          }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--muted-foreground)", fontWeight: 500, marginBottom: 8 }}>
              Field display
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12, alignItems: "baseline" }}>
              <div style={{ fontSize: "13px", color: "var(--muted-foreground)", fontWeight: 500 }}>Identifier</div>
              <div style={{ fontSize: "13px", color: "var(--foreground)" }}>rachel.chen@example.com</div>
              <div style={{ fontSize: "13px", color: "var(--muted-foreground)", fontWeight: 500 }}>ID</div>
              <div style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: "var(--foreground)" }}>01HZK7M8N9P0Q1R2S3T4U5V6W7</div>
            </div>
          </div>
          <div style={{
            borderRadius: "var(--radius-xl, 12px)",
            border: "1px solid var(--border)",
            background: "var(--card)",
            padding: 20,
          }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--muted-foreground)", fontWeight: 500, marginBottom: 8 }}>
              Inline code
            </div>
            <p style={{ margin: 0, fontSize: "13.5px", color: "var(--foreground)", lineHeight: 1.6 }}>
              The token <code>--primary</code> drives the accent; override it on <code>&lt;html&gt;</code> to retint on the web.
            </p>
          </div>
        </div>
      </Section>

      <PageNav />
    </div>
  );
}
