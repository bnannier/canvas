import { PageNav } from "@/components/page-nav";

/**
 * Documents the canvas.utilities layer. The demos below use the real shipped
 * utility classes (canvas.css is imported app-wide), so this page also serves as
 * a live smoke test of the layer.
 */

function Section({ title, description, anatomy, children }: {
  title: string;
  description?: string;
  anatomy?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <header style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600, letterSpacing: "-0.015em", color: "hsl(var(--foreground))" }}>
          {title}
        </h2>
        {description && (
          <p style={{ marginTop: 4, marginBottom: 0, fontSize: "13.5px", color: "hsl(var(--muted-foreground))", maxWidth: 640, lineHeight: 1.6 }}>
            {description}
          </p>
        )}
      </header>
      {anatomy && (
        <div style={{
          marginBottom: 16,
          padding: "12px 16px",
          borderRadius: "var(--radius-lg, 8px)",
          background: "hsl(var(--muted) / 0.4)",
          border: "1px solid hsl(var(--border))",
          fontSize: "12.5px",
          color: "hsl(var(--muted-foreground))",
        }}>
          <span style={{ fontWeight: 600, color: "hsl(var(--foreground))", marginRight: 8 }}>Anatomy.</span>
          {anatomy}
        </div>
      )}
      {children}
    </section>
  );
}

/** A live demo box: renders the children, then shows the class string used. */
function Demo({ code, children, minHeight }: { code: string; children: React.ReactNode; minHeight?: number }) {
  return (
    <div style={{
      border: "1px solid hsl(var(--border))",
      borderRadius: "var(--radius-xl, 12px)",
      overflow: "hidden",
      marginBottom: 12,
      background: "hsl(var(--card))",
    }}>
      <div style={{ padding: 16, minHeight }}>{children}</div>
      <div style={{ borderTop: "1px solid hsl(var(--border))", background: "hsl(var(--muted) / 0.3)", padding: "8px 12px" }}>
        <code style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{code}</code>
      </div>
    </div>
  );
}

/** A small labelled tile. Color comes from inline style (Canvas ships no color utilities). */
function Tile({ children, full }: { children?: React.ReactNode; full?: boolean }) {
  return (
    <div style={{
      background: "hsl(var(--primary) / 0.15)",
      border: "1px solid hsl(var(--primary) / 0.35)",
      borderRadius: "var(--radius-md, 6px)",
      padding: "10px 14px",
      fontSize: "12px",
      fontWeight: 600,
      color: "hsl(var(--primary))",
      textAlign: "center" as const,
      width: full ? "100%" : undefined,
    }}>
      {children}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <code style={{
      display: "inline-block",
      fontSize: "11.5px",
      fontFamily: "var(--font-mono)",
      padding: "2px 7px",
      borderRadius: "var(--radius-sm, 4px)",
      background: "hsl(var(--muted))",
      color: "hsl(var(--foreground))",
      border: "1px solid hsl(var(--border))",
    }}>
      {children}
    </code>
  );
}

const GAP_SCALE = ["0", "px", "0-5", "1", "1-5", "2", "2-5", "3", "4", "5", "6", "8", "10", "12", "16"];

export function UtilitiesPage() {
  return (
    <div>
      <section style={{ marginBottom: 32 }}>
        <h1 style={{
          margin: 0,
          fontSize: "clamp(32px, 5vw, 40px)",
          fontWeight: 700,
          letterSpacing: "-0.025em",
          color: "hsl(var(--foreground))",
        }}>
          Layout utilities
        </h1>
        <p style={{
          marginTop: 12,
          maxWidth: "44rem",
          fontSize: "14.5px",
          lineHeight: 1.6,
          color: "hsl(var(--muted-foreground))",
        }}>
          Canvas ships a layout utility layer, display, flexbox, grid, gap, sizing,
          and position, as real static CSS. The vocabulary follows Tailwind so it is
          instantly familiar, but the classes are generated and committed (no build
          step, no Tailwind dependency). Gap utilities reference the
          {" "}<Chip>--space-*</Chip> tokens, so spacing stays themeable.
        </p>
      </section>

      <Section
        title="How it works"
        description="Utilities live in the canvas.utilities cascade layer, declared last, so a utility always wins over a component or pattern default for the same property. Every utility also has responsive variants using mobile-first breakpoint prefixes."
        anatomy="Layer order: canvas.reset, canvas.tokens, canvas.base, canvas.components, canvas.patterns, canvas.utilities. Breakpoints (min-width): sm 640, md 768, lg 1024, xl 1280, 2xl 1536. Prefix any class: md:flex, lg:grid-cols-3, xl:gap-8."
      >
        <div className="flex flex-wrap gap-2">
          <Chip>flex</Chip><Chip>sm:flex</Chip><Chip>md:grid</Chip><Chip>lg:grid-cols-3</Chip>
          <Chip>xl:gap-8</Chip><Chip>2xl:flex-row</Chip>
        </div>
      </Section>

      <Section title="Display" description="block, inline-block, inline, flex, inline-flex, grid, inline-grid, hidden.">
        <Demo code='<div class="flex items-center gap-3">'>
          <div className="flex items-center gap-3">
            <Tile>flex</Tile><Tile>item</Tile><Tile>item</Tile>
          </div>
        </Demo>
        <Demo code='<div class="grid grid-cols-3 gap-3">'>
          <div className="grid grid-cols-3 gap-3">
            <Tile>grid</Tile><Tile>cols-3</Tile><Tile>gap-3</Tile>
          </div>
        </Demo>
      </Section>

      <Section title="Flexbox alignment" description="justify-* controls the main axis; items-* the cross axis. Plus direction, wrap, grow, shrink, and self-*.">
        <Demo code='<div class="flex justify-between items-center gap-3">'>
          <div className="flex justify-between items-center gap-3">
            <Tile>start</Tile><Tile>middle</Tile><Tile>end</Tile>
          </div>
        </Demo>
        <Demo code='<div class="flex justify-center gap-2">'>
          <div className="flex justify-center gap-2">
            <Tile>centered</Tile><Tile>row</Tile>
          </div>
        </Demo>
        <Demo code='<div class="flex flex-col gap-2">'>
          <div className="flex flex-col gap-2">
            <Tile>flex-col</Tile><Tile>stacks</Tile><Tile>vertically</Tile>
          </div>
        </Demo>
      </Section>

      <Section
        title="Gap (token-backed)"
        description="gap, gap-x, and gap-y across the full spacing scale. Each references a --space-* token rather than a hardcoded rem, so changing a token reflows every gap that uses it."
      >
        <div className="flex flex-col gap-2">
          {GAP_SCALE.map((v) => (
            <div key={v} className={`flex items-center gap-${v}`} style={{
              padding: "8px 12px",
              border: "1px dashed hsl(var(--border))",
              borderRadius: "var(--radius-md, 6px)",
            }}>
              <span style={{ width: 84, flexShrink: 0 }}><Chip>gap-{v}</Chip></span>
              <div className={`flex gap-${v}`}>
                <Tile> </Tile><Tile> </Tile><Tile> </Tile>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Grid" description="grid-cols-1..6, grid-cols-none, col-span-*, grid-flow-*, plus grid-cols-auto-fit / auto-fill for responsive tiling without media queries.">
        <Demo code='<div class="grid grid-cols-4 gap-3">'>
          <div className="grid grid-cols-4 gap-3">
            <Tile>1</Tile><Tile>2</Tile><Tile>3</Tile><Tile>4</Tile>
          </div>
        </Demo>
        <Demo code='<div class="grid grid-cols-3 gap-3"> ... col-span-2'>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2"><Tile full>col-span-2</Tile></div>
            <Tile>1</Tile>
          </div>
        </Demo>
        <Demo code='<div class="grid grid-cols-auto-fit gap-3">'>
          <div className="grid grid-cols-auto-fit gap-3">
            <Tile>auto</Tile><Tile>fit</Tile><Tile>wraps</Tile><Tile>to fit</Tile>
          </div>
        </Demo>
      </Section>

      <Section
        title="Responsive prefixes"
        description="Prefix any utility with a breakpoint. Resize the window to watch these change at the md (768px) boundary."
      >
        <Demo code='<div class="grid grid-cols-1 md:grid-cols-3 gap-3">'>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Tile>1 col on mobile</Tile><Tile>3 cols at md</Tile><Tile>and up</Tile>
          </div>
        </Demo>
        <Demo code='<span class="hidden md:flex"> / <span class="flex md:hidden">'>
          <div className="flex items-center gap-3">
            <span className="hidden md:flex"><Tile>visible at md and up</Tile></span>
            <span className="flex md:hidden"><Tile>visible below md</Tile></span>
          </div>
        </Demo>
      </Section>

      <Section
        title="Layer precedence"
        description="Because canvas.utilities is the last layer, a utility overrides a component's own value for the same property, no !important needed."
        anatomy="Below, .btn-icon sets a fixed square width in canvas.components. Adding w-full (canvas.utilities) overrides it. Same specificity, later layer wins."
      >
        <Demo code='<button class="btn btn-outline btn-icon"> vs <button class="btn btn-outline btn-icon w-full">'>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <button className="btn btn-outline btn-icon">★</button>
              <span style={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }}>.btn-icon, fixed square width</span>
            </div>
            <button className="btn btn-outline btn-icon w-full">★ &nbsp; .btn-icon.w-full, utility wins</button>
          </div>
        </Demo>
      </Section>

      <PageNav />
    </div>
  );
}
