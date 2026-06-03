import { PageNav } from "@/components/page-nav";

const SPACING = [
  { tw: "p-1", px: 4 }, { tw: "p-2", px: 8 }, { tw: "p-3", px: 12 }, { tw: "p-4", px: 16 },
  { tw: "p-5", px: 20 }, { tw: "p-6", px: 24 }, { tw: "p-8", px: 32 }, { tw: "p-10", px: 40 }, { tw: "p-12", px: 48 },
];

const RADII = [
  { name: "sm", px: 4, use: "Inline code, kbd, micro chips", varName: "--radius-sm" },
  { name: "md", px: 6, use: "Inputs, buttons, badges", varName: "--radius-md" },
  { name: "lg", px: 8, use: "Default, set by --radius", varName: "--radius" },
  { name: "xl", px: 12, use: "Cards, sections", varName: "--radius-xl" },
  { name: "2xl", px: 16, use: "Hero panels, splashes", varName: "--radius-2xl" },
  { name: "full", px: 0, label: "∞", use: "Avatars, pills, status dots" },
];

const SHADOWS = [
  { name: "sm", shadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", use: "Buttons, inputs at rest" },
  { name: "", shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)", use: "Cards" },
  { name: "lg", shadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)", use: "Popovers, dropdowns" },
  { name: "xl", shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)", use: "Modals, slide-overs" },
  { name: "2xl", shadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)", use: "Spotlight overlays" },
];

const ZINDEX = [
  { z: 0, name: "Page content", note: "Default flow" },
  { z: 20, name: "Topbar (sticky)", note: "Stays above page scroll" },
  { z: 30, name: "Mobile sidebar backdrop", note: "Below the drawer" },
  { z: 40, name: "Sidebar drawer", note: "Above backdrop" },
  { z: 50, name: "Popovers / row menus", note: "In-page floating UI" },
  { z: 9000, name: "SlideOver", note: "Drawer with focus trap" },
  { z: 9999, name: "Command palette", note: "⌘K shortcut surface" },
  { z: 99999, name: "Confirm modal", note: "Blocks everything" },
  { z: 100000, name: "Toast", note: "Always-visible feedback" },
];

const DENSITY = [
  { name: "compact", padding: "8px 12px" },
  { name: "regular", padding: "12px 16px" },
  { name: "comfy", padding: "16px 18px" },
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

export function SpacingPage() {
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
          Spacing & Shape
        </h1>
        <p style={{
          marginTop: 12,
          maxWidth: "42rem",
          fontSize: "14.5px",
          lineHeight: 1.6,
          color: "var(--muted-foreground)",
        }}>
          The 4px grid governs all of Canvas. Every padding, margin, gap, width, and height is a multiple
          of 4. Radii follow a strict ramp set by <code>--radius</code> (which the Tweaks panel mutates
          live). Shadows come from Tailwind's defaults; we don't ship a custom shadow set.
        </p>
      </section>

      <Section
        title="Spacing ramp"
        description="Tailwind's default 4px-based scale. We use 1-12 in practice; anything larger should probably be a layout decision instead of an in-component value."
      >
        <div style={{
          borderRadius: "var(--radius-xl, 12px)",
          border: "1px solid var(--border)",
          background: "var(--card)",
          padding: 20,
        }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
            {SPACING.map((s) => (
              <div key={s.tw} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: s.px,
                  height: s.px,
                  background: "color-mix(in oklch, var(--primary) 20%, transparent)",
                  border: "1px solid color-mix(in oklch, var(--primary) 40%, transparent)",
                  borderRadius: "var(--radius-sm, 4px)",
                }} />
                <code style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{s.tw}</code>
                <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}>{s.px}px</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="Radius scale"
        description="Driven by --radius (default 8px). Components don't hardcode pixel radii; they reference rounded-md, rounded-lg, rounded-xl which all bend with the token."
        anatomy="The default --radius is what Tweaks → Radius mutates. Components pin to a relative size (sm/md/lg/xl/full) so the system stays proportional when the user dials radius up or down."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
          {RADII.map((r) => (
            <div key={r.name} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
              <div style={{
                width: "100%",
                height: 80,
                background: "color-mix(in oklch, var(--primary) 20%, transparent)",
                border: "1px solid color-mix(in oklch, var(--primary) 40%, transparent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontFamily: "var(--font-mono)",
                color: "var(--primary)",
                borderRadius: r.px ? r.px : 9999,
              }}>
                {r.label}
              </div>
              <div style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--foreground)" }}>
                rounded-{r.name}
              </div>
              <code style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                {r.px ? r.px + "px" : "9999px"}
              </code>
              <div style={{ fontSize: "10.5px", color: "var(--muted-foreground)", lineHeight: 1.4 }}>{r.use}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Shadows" description="From low to high; choose by elevation, not by style.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
          {SHADOWS.map((s) => (
            <div key={s.shadow} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
              <div style={{
                width: "100%",
                height: 80,
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-xl, 12px)",
                boxShadow: s.shadow,
              }} />
              <div style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--foreground)" }}>
                shadow{s.name ? `-${s.name}` : ""}
              </div>
              <div style={{ fontSize: "10.5px", color: "var(--muted-foreground)", lineHeight: 1.4 }}>{s.use}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Z-index reserves" description="A handful of stack levels; keep them named, not magic numbers.">
        <div style={{
          borderRadius: "var(--radius-xl, 12px)",
          border: "1px solid var(--border)",
          background: "var(--card)",
          overflow: "hidden",
        }}>
          {ZINDEX.map((r, i) => (
            <div key={r.z} style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "12px 20px",
              borderTop: i ? "1px solid var(--border)" : undefined,
            }}>
              <code style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--muted-foreground)", width: 80 }}>
                z-{r.z}
              </code>
              <div style={{ flex: 1, fontSize: "13px", fontWeight: 500, color: "var(--foreground)" }}>{r.name}</div>
              <div style={{ fontSize: "11.5px", color: "var(--muted-foreground)" }}>{r.note}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Component density" description="Three density modes affect padding/font on tables and content. Toggle in the Tweaks panel.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {DENSITY.map((d) => (
            <div key={d.name} style={{
              borderRadius: "var(--radius-xl, 12px)",
              border: "1px solid var(--border)",
              background: "var(--card)",
              padding: 20,
            }}>
              <div style={{
                fontSize: "11px",
                textTransform: "uppercase" as const,
                letterSpacing: "0.08em",
                color: "var(--muted-foreground)",
                fontWeight: 500,
                marginBottom: 8,
              }}>
                {d.name}
              </div>
              <div style={{ fontSize: "13.5px", color: "var(--foreground)" }}>Row padding</div>
              <code style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{d.padding}</code>
            </div>
          ))}
        </div>
      </Section>

      <PageNav />
    </div>
  );
}
