import { PageNav } from "@/components/page-nav";

const SPACING = [
  { tw: "p-1", px: 4 }, { tw: "p-2", px: 8 }, { tw: "p-3", px: 12 }, { tw: "p-4", px: 16 },
  { tw: "p-5", px: 20 }, { tw: "p-6", px: 24 }, { tw: "p-8", px: 32 }, { tw: "p-10", px: 40 }, { tw: "p-12", px: 48 },
];

const RADII = [
  { name: "sm", px: 4, use: "Inline code, kbd, micro chips", varName: "--radius-sm" },
  { name: "md", px: 6, use: "Inputs, buttons, badges", varName: "--radius-md" },
  { name: "lg", px: 8, use: "Default radius", varName: "--radius-lg" },
  { name: "xl", px: 12, use: "Cards, sections", varName: "--radius-xl" },
  { name: "full", px: 0, label: "∞", use: "Avatars, pills, status dots" },
];

// The shadow() helper (src/style/shadow.ts) ships a fixed six-level elevation
// preset; the CSS box-shadow here mirrors each RN preset, and elev is its
// Android elevation. There is no "2xl".
const SHADOWS = [
  { name: "none", shadow: "none", elev: 0, use: "Flat; flush with the surface" },
  { name: "sm", shadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", elev: 1, use: "Buttons, inputs at rest" },
  { name: "", shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)", elev: 2, use: "Cards (the default)" },
  { name: "md", shadow: "0 4px 6px 0 rgb(0 0 0 / 0.1)", elev: 4, use: "Raised cards, menus" },
  { name: "lg", shadow: "0 10px 15px 0 rgb(0 0 0 / 0.1)", elev: 8, use: "Popovers, dropdowns" },
  { name: "xl", shadow: "0 20px 25px 0 rgb(0 0 0 / 0.1)", elev: 12, use: "Modals, slide-overs" },
];

// Canvas keeps a deliberately shallow z-index scale: components use only 10, 40,
// and 50 (every overlay shares 50), so there are no escalating magic numbers.
const ZINDEX = [
  { z: 0, name: "Base content", note: "Default flow; no z-index" },
  { z: 10, name: "In-component layering", note: "Input addons, button-group overlaps" },
  { z: 40, name: "Open dropdown", note: "Floats above neighbouring content" },
  { z: 50, name: "Overlays", note: "Popovers, menus, selects, dialogs, command" },
];

// DataTable implements compact + regular only; values are the real cell paddings
// (horizontal / vertical). comfy is a theme level other components opt into.
const DENSITY = [
  { name: "compact", padding: "16 / 8" },
  { name: "regular", padding: "16 / 12" },
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
          of 4. Radii follow a fixed four-tier scale (sm, md, lg, xl) plus full for pills; components
          reference rounded-sm/md/lg/xl, which map to the radius tokens. Shadows are a fixed elevation preset (none, sm, the default, md, lg, xl), shipped by the shadow() helper rather than Tailwind.
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
        description="Four fixed tiers, sm through xl, plus full for pills. Components reference the rounded-sm/md/lg/xl utilities, which map to the --radius-* tokens, so radii stay consistent across the kit. Native and web agree on md/lg/xl (6/8/12px); they diverge only at sm, which is 4px via the web --radius-sm var but 2px in the native radius scale."
        anatomy="Components pin to a relative tier (sm/md/lg/xl/full) rather than hardcoding pixels, so radii stay proportional across the kit. The tiers are fixed tokens, not a runtime-adjustable knob."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
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

      <Section title="Shadows" description="A fixed elevation preset, low to high. Each level ships matching iOS shadow values and an Android elevation; choose by elevation, not by style.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
          {SHADOWS.map((s) => (
            <div key={s.name || "default"} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
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
              <code style={{ fontSize: "10.5px", fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}>elevation {s.elev}</code>
              <div style={{ fontSize: "10.5px", color: "var(--muted-foreground)", lineHeight: 1.4 }}>{s.use}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Z-index reserves" description="Canvas keeps a deliberately shallow z-index scale. Components reach for just three levels (10, 40, 50); every overlay shares 50 rather than escalating into magic numbers.">
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

      <Section title="Component density" description="Density is a theme-level setting (compact, regular, comfy) that each component maps to its own metrics; there is no single global padding token. Below are the DataTable cell paddings (horizontal / vertical) for the two densities it implements; comfy is a theme value other components opt into (a Card goes from 16px padding at compact to 32px when comfortable). Set it with setDensity() on the web, or per-component density props like Card compact on native.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
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
              <div style={{ fontSize: "13.5px", color: "var(--foreground)" }}>Cell padding (h / v)</div>
              <code style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{d.padding}</code>
            </div>
          ))}
        </div>
      </Section>

      <PageNav />
    </div>
  );
}
