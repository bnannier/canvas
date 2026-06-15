import { Markdown } from "@/components/markdown";
import { PageNav } from "@/components/page-nav";
import cssVarsCode from "./snippets/tokens/css-vars.md?raw";
import themeBridgeCode from "./snippets/tokens/theme-bridge.md?raw";
import dynamicCode from "./snippets/tokens/dynamic.md?raw";
import dontCode from "./snippets/tokens/dont.md?raw";
import doCode from "./snippets/tokens/do.md?raw";

const SEMANTIC_PAIRS = [
  { name: "Background", varName: "--background", light: "oklch(1 0 0)", dark: "oklch(0.141 0.005 285.823)", bgVar: "var(--background)" },
  { name: "Foreground", varName: "--foreground", light: "oklch(0.141 0.005 285.823)", dark: "oklch(0.985 0 0)", bgVar: "var(--foreground)" },
  { name: "Card", varName: "--card", light: "oklch(1 0 0)", dark: "oklch(0.21 0.006 285.885)", bgVar: "var(--card)" },
  { name: "Popover", varName: "--popover", light: "oklch(1 0 0)", dark: "oklch(0.21 0.006 285.885)", bgVar: "var(--popover)" },
  { name: "Primary", varName: "--primary", light: "oklch(0.511 0.262 276.966)", dark: "oklch(0.585 0.233 277.117)", bgVar: "var(--primary)" },
  { name: "Secondary", varName: "--secondary", light: "oklch(0.967 0.001 286.375)", dark: "oklch(0.274 0.006 286.033)", bgVar: "var(--secondary)" },
  { name: "Muted", varName: "--muted", light: "oklch(0.967 0.001 286.375)", dark: "oklch(0.274 0.006 286.033)", bgVar: "var(--muted)" },
  { name: "Accent", varName: "--accent", light: "oklch(0.967 0.001 286.375)", dark: "oklch(0.274 0.006 286.033)", bgVar: "var(--accent)" },
  { name: "Destructive", varName: "--destructive", light: "oklch(0.577 0.245 27.325)", dark: "oklch(0.704 0.191 22.216)", bgVar: "var(--destructive)" },
  { name: "Border", varName: "--border", light: "oklch(0.92 0.004 286.32)", dark: "oklch(0.274 0.006 286.033)", bgVar: "var(--border)" },
  { name: "Input", varName: "--input", light: "oklch(0.92 0.004 286.32)", dark: "oklch(0.274 0.006 286.033)", bgVar: "var(--input)" },
  { name: "Ring", varName: "--ring", light: "oklch(0.585 0.233 277.117)", dark: "oklch(0.585 0.233 277.117)", bgVar: "var(--ring)" },
];

const ACCENT_OPTIONS = [
  { name: "Indigo (default)", h: 240, s: 79, l: 60 },
  { name: "Violet", h: 271, s: 70, l: 60 },
  { name: "Teal", h: 173, s: 70, l: 42 },
  { name: "Rose", h: 346, s: 78, l: 58 },
  { name: "Amber", h: 38, s: 92, l: 50 },
  { name: "Slate", h: 215, s: 16, l: 38 },
];

const STATUS = [
  { name: "Success", light: { bg: "#dcfce7", fg: "#166534" }, dark: { bg: "rgba(20,83,45,0.3)", fg: "#4ade80" } },
  { name: "Warning", light: { bg: "#fef9c3", fg: "#854d0e" }, dark: { bg: "rgba(113,63,18,0.3)", fg: "#facc15" } },
  { name: "Error", light: { bg: "#fee2e2", fg: "#991b1b" }, dark: { bg: "rgba(127,29,29,0.3)", fg: "#f87171" } },
  { name: "Info", light: { bg: "#dbeafe", fg: "#1e40af" }, dark: { bg: "rgba(30,58,138,0.3)", fg: "#60a5fa" } },
  { name: "Neutral", light: { bg: "#f4f4f5", fg: "#3f3f46" }, dark: { bg: "rgba(63,63,70,0.3)", fg: "#a1a1aa" } },
];

const CHART_PALETTE = [
  { name: "Chart 1", varName: "--chart-1", light: "12 76% 61%", dark: "220 70% 50%" },
  { name: "Chart 2", varName: "--chart-2", light: "173 58% 39%", dark: "160 60% 45%" },
  { name: "Chart 3", varName: "--chart-3", light: "197 37% 24%", dark: "30 80% 55%" },
  { name: "Chart 4", varName: "--chart-4", light: "43 74% 66%", dark: "280 65% 60%" },
  { name: "Chart 5", varName: "--chart-5", light: "27 87% 67%", dark: "340 75% 55%" },
];

const BRAND = [
  { name: "Orb Indigo", hex: "#6366f1", varName: "--orb-indigo" },
  { name: "Orb Violet", hex: "#8b5cf6", varName: "--orb-violet" },
  { name: "Orb Cyan", hex: "#06b6d4", varName: "--orb-cyan" },
];

function ColorPair({ row }: { row: typeof SEMANTIC_PAIRS[number] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          height: 80,
          borderRadius: "var(--radius-lg, 8px)",
          border: "1px solid var(--border)",
          background: row.bgVar,
        }}
      />
      <div style={{ marginTop: 8, fontSize: "12.5px", fontWeight: 500, color: "var(--foreground)" }}>
        {row.name}
      </div>
      <code style={{ display: "block", fontSize: "11px", color: "var(--muted-foreground)", lineHeight: 1.4, marginTop: 2 }}>
        {row.varName}
      </code>
      <div style={{ marginTop: 4, fontSize: "10.5px", fontFamily: "var(--font-mono)", color: "var(--muted-foreground)", lineHeight: 1.4 }}>
        <div>L · {row.light}</div>
        <div>D · {row.dark}</div>
      </div>
    </div>
  );
}

function AccentChip({ a }: { a: typeof ACCENT_OPTIONS[number] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          height: 80,
          borderRadius: "var(--radius-lg, 8px)",
          border: "1px solid var(--border)",
          background: `hsl(${a.h} ${a.s}% ${a.l}%)`,
        }}
      />
      <div style={{ marginTop: 8, fontSize: "12.5px", fontWeight: 500, color: "var(--foreground)" }}>
        {a.name}
      </div>
      <div style={{ fontSize: "10.5px", fontFamily: "var(--font-mono)", color: "var(--muted-foreground)", lineHeight: 1.4 }}>
        hsl({a.h} {a.s}% {a.l}%)
      </div>
    </div>
  );
}

function StatusRow({ s }: { s: typeof STATUS[number] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--foreground)" }}>{s.name}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <div
            style={{
              height: 48,
              borderRadius: "var(--radius-md, 6px)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 500,
              background: s.light.bg,
              color: s.light.fg,
            }}
          >
            Light
          </div>
          <div style={{ marginTop: 4, fontSize: "10.5px", fontFamily: "var(--font-mono)", color: "var(--muted-foreground)", lineHeight: 1.4 }}>
            <div>bg {s.light.bg}</div>
            <div>fg {s.light.fg}</div>
          </div>
        </div>
        <div>
          <div
            style={{
              height: 48,
              borderRadius: "var(--radius-md, 6px)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 500,
              background: s.dark.bg,
              color: s.dark.fg,
            }}
          >
            Dark
          </div>
          <div style={{ marginTop: 4, fontSize: "10.5px", fontFamily: "var(--font-mono)", color: "var(--muted-foreground)", lineHeight: 1.4 }}>
            <div>bg {s.dark.bg}</div>
            <div>fg {s.dark.fg}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartChip({ c }: { c: typeof CHART_PALETTE[number] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          height: 64,
          borderRadius: "var(--radius-lg, 8px)",
          border: "1px solid var(--border)",
          background: `var(${c.varName})`,
        }}
      />
      <div style={{ marginTop: 8, fontSize: "12.5px", fontWeight: 500, color: "var(--foreground)" }}>
        {c.name}
      </div>
      <code style={{ fontSize: "11px", color: "var(--muted-foreground)", lineHeight: 1.4 }}>
        {c.varName}
      </code>
      <div style={{ marginTop: 4, fontSize: "10.5px", fontFamily: "var(--font-mono)", color: "var(--muted-foreground)", lineHeight: 1.4 }}>
        <div>L · {c.light}</div>
        <div>D · {c.dark}</div>
      </div>
    </div>
  );
}

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

export function TokensPage() {
  return (
    <div>
      {/* Intro */}
      <section style={{ marginBottom: 32 }}>
        <h1 style={{
          margin: 0,
          fontSize: "clamp(32px, 5vw, 40px)",
          fontWeight: 700,
          letterSpacing: "-0.025em",
          color: "var(--foreground)",
        }}>
          Colors & Theme
        </h1>
        <p style={{
          marginTop: 12,
          maxWidth: "42rem",
          fontSize: "14.5px",
          lineHeight: 1.6,
          color: "var(--muted-foreground)",
        }}>
          Canvas uses a semantic token system. Every color is an oklch value bound to a CSS
          custom property. Tailwind utilities (<code>bg-primary</code>, <code>text-muted-foreground</code>,{" "}
          <code>border-border</code>, &#8230;) resolve through those vars via <code>@theme inline</code>, so
          switching themes is just rewriting the variables. On native, the same tokens ship as hex values
          read through <code>useTheme()</code>.
        </p>
        <div style={{
          marginTop: 16,
          padding: "12px 16px",
          borderRadius: "var(--radius-lg, 8px)",
          background: "color-mix(in oklch, var(--muted) 40%, transparent)",
          border: "1px solid var(--border)",
          fontSize: "12.5px",
          color: "var(--muted-foreground)",
        }}>
          <span style={{ fontWeight: 600, color: "var(--foreground)", marginRight: 8 }}>Try this.</span>
          Toggle the surface or change the theme. Every swatch below reacts live.
        </div>
      </section>

      {/* Semantic palette */}
      <Section
        title="Semantic palette"
        description="The core token set. Every component reads from these, never from raw color literals."
        anatomy="Each token has a paired foreground for legible content on top (e.g. primary / primary-foreground). Use the pair together to guarantee contrast in both themes."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
          {SEMANTIC_PAIRS.map((row) => <ColorPair key={row.varName} row={row} />)}
        </div>
      </Section>

      {/* Accent options */}
      <Section
        title="Accent options"
        description="The default --primary is Indigo. Point --primary and --ring at any of these six curated hues to re-skin the whole system; they sit at similar perceived weight (chroma and lightness held roughly constant)."
        anatomy="Accents only override --primary and --ring. All foreground pairings are recalculated downstream via Tailwind's color-mix() opacity utilities, so you don't restate them per accent."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
          {ACCENT_OPTIONS.map((a) => <AccentChip key={a.name} a={a} />)}
        </div>
      </Section>

      {/* Semantic status colors */}
      <Section
        title="Semantic status colors"
        description="Five tones used by StatusBadge and inline alerts. Dark mode uses translucent backgrounds so they read on the deeper page palette without punching through."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
          {STATUS.map((s) => <StatusRow key={s.name} s={s} />)}
        </div>
        <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 8 }}>
          <span className="status-badge sb-success"><span className="dot" />Active</span>
          <span className="status-badge sb-warning"><span className="dot" />Pending</span>
          <span className="status-badge sb-error"><span className="dot" />Failed</span>
          <span className="status-badge sb-info"><span className="dot" />Info</span>
          <span className="status-badge sb-neutral"><span className="dot" />Inactive</span>
        </div>
      </Section>

      {/* Chart palette */}
      <Section
        title="Chart palette"
        description="Five colors tuned for data viz, distinct enough at small marks (1-2px), no two adjacent hues vibrating. The dark-mode set is independently chosen (not just lightness-flipped) for the same readability bar."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
          {CHART_PALETTE.map((c) => <ChartChip key={c.varName} c={c} />)}
        </div>
      </Section>

      {/* Brand colors */}
      <Section
        title="Brand colors"
        description="Reserved for brand moments: the avatar gradient, sign-in orbs, marketing splashes. Never used as component fills."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
          {BRAND.map((b) => (
            <div key={b.varName} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{
                height: 80,
                borderRadius: "var(--radius-lg, 8px)",
                border: "1px solid var(--border)",
                background: b.hex,
              }} />
              <div style={{ marginTop: 8, fontSize: "12.5px", fontWeight: 500, color: "var(--foreground)" }}>
                {b.name}
              </div>
              <code style={{ fontSize: "11px", color: "var(--muted-foreground)", lineHeight: 1.4 }}>
                {b.varName}
              </code>
              <div style={{ fontSize: "10.5px", fontFamily: "var(--font-mono)", color: "var(--muted-foreground)", lineHeight: 1.4, marginTop: 2 }}>
                {b.hex}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{
              height: 80,
              borderRadius: "var(--radius-lg, 8px)",
              border: "1px solid var(--border)",
              background: "linear-gradient(135deg, var(--orb-indigo), var(--orb-violet))",
            }} />
            <div style={{ marginTop: 8, fontSize: "12.5px", fontWeight: 500, color: "var(--foreground)" }}>
              Avatar gradient
            </div>
            <code style={{ fontSize: "11px", color: "var(--muted-foreground)", lineHeight: 1.4 }}>
              --orb-indigo → --orb-violet
            </code>
          </div>
        </div>
      </Section>

      {/* Glass surface */}
      <Section
        title="Glass surface"
        description={`Canvas ships a glass surface mode: set surface="glass" on the ThemeProvider, or call setSurface("glass") on the web (it sets data-surface="glass" on <html>). Following Apple's Liquid Glass model, only the functional layer goes translucent.`}
        anatomy={`Glass overrides exactly one token: popover. Light becomes rgba(255, 255, 255, 0.72); dark becomes rgba(30, 30, 34, 0.66). The card token stays solid, so content surfaces (cards, lists, tables, charts) never turn to glass; only popover-backed overlays (popovers, menus, dropdowns, selects, dialogs, sheets, command) and the navbar/sidebar shells read as glass.`}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {[
            { label: "Light · popover", fill: "rgba(255, 255, 255, 0.72)", grad: "linear-gradient(135deg, var(--orb-indigo), var(--orb-cyan))" },
            { label: "Dark · popover", fill: "rgba(30, 30, 34, 0.66)", grad: "linear-gradient(135deg, var(--orb-violet), var(--orb-indigo))" },
          ].map((g) => (
            <div key={g.label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{
                height: 96,
                borderRadius: "var(--radius-lg, 8px)",
                border: "1px solid var(--border)",
                background: g.grad,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}>
                <div style={{
                  width: "62%",
                  height: "56%",
                  borderRadius: "var(--radius-md, 6px)",
                  background: g.fill,
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  boxShadow: "0 8px 24px rgb(0 0 0 / 0.18)",
                }} />
              </div>
              <div style={{ marginTop: 8, fontSize: "12.5px", fontWeight: 500, color: "var(--foreground)" }}>
                {g.label}
              </div>
              <code style={{ fontSize: "11px", color: "var(--muted-foreground)", lineHeight: 1.4 }}>
                {g.fill}
              </code>
            </div>
          ))}
        </div>
      </Section>

      {/* How theming works */}
      <Section
        title="How theming works"
        description="The same utility resolves to different values in different contexts. No re-skinning, no per-page overrides."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          <div style={{
            borderRadius: "var(--radius-xl, 12px)",
            border: "1px solid var(--border)",
            background: "var(--card)",
            padding: 20,
          }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)", marginBottom: 8 }}>
              1 · CSS variables (tokens.css)
            </div>
            <Markdown source={cssVarsCode} />
          </div>
          <div style={{
            borderRadius: "var(--radius-xl, 12px)",
            border: "1px solid var(--border)",
            background: "var(--card)",
            padding: 20,
          }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)", marginBottom: 8 }}>
              2 · Tailwind theme bridge
            </div>
            <Markdown source={themeBridgeCode} />
          </div>
        </div>
        <div style={{
          marginTop: 16,
          borderRadius: "var(--radius-xl, 12px)",
          border: "1px solid var(--border)",
          background: "var(--card)",
          padding: 20,
        }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)", marginBottom: 8 }}>
            3 · Utilities resolve dynamically
          </div>
          <Markdown source={dynamicCode} />
          <p style={{
            marginTop: 12,
            marginBottom: 0,
            fontSize: "12.5px",
            color: "var(--muted-foreground)",
          }}>
            The accent picker mutates <code>--primary</code> directly on <code>&lt;html&gt;</code>; because{" "}
            <code>@theme inline</code> preserves the <code>var()</code> reference (not the resolved value),
            every utility everywhere in the page reflows.
          </p>
        </div>
      </Section>

      {/* Don'ts */}
      <Section title="Don'ts">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          <div style={{
            borderRadius: "var(--radius-xl, 12px)",
            border: "1px solid hsl(0 70% 60% / 0.3)",
            background: "hsl(0 70% 60% / 0.05)",
            padding: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--destructive)", fontWeight: 600, marginBottom: 4 }}>
              Don't
            </div>
            <Markdown source={dontCode} />
            <p style={{ marginTop: 8, fontSize: "12.5px", color: "var(--muted-foreground)", margin: "8px 0 0" }}>
              Hard-coded hex bypasses the theme. Won't follow accent changes; will look wrong in dark mode.
            </p>
          </div>
          <div style={{
            borderRadius: "var(--radius-xl, 12px)",
            border: "1px solid hsl(143 70% 45% / 0.3)",
            background: "hsl(143 70% 45% / 0.05)",
            padding: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "hsl(143 60% 38%)", fontWeight: 600, marginBottom: 4 }}>
              Do
            </div>
            <Markdown source={doCode} />
            <p style={{ marginTop: 8, fontSize: "12.5px", color: "var(--muted-foreground)", margin: "8px 0 0" }}>
              Always token-routed. Theme changes are free.
            </p>
          </div>
        </div>
      </Section>

      <PageNav />
    </div>
  );
}
