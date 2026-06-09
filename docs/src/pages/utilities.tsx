import { View } from "@olympusoss/canvas";
import { PageNav } from "@/components/page-nav";

/**
 * Documents the layout utility vocabulary. The demos render real Canvas <View>
 * primitives, so the engine resolves each className to a React Native style the
 * same way it does in the kit, and the page doubles as a live smoke test.
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

/** A live demo box: renders the children, then shows the class string used. */
function Demo({ code, children, minHeight }: { code: string; children: React.ReactNode; minHeight?: number }) {
  return (
    <div style={{
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-xl, 12px)",
      overflow: "hidden",
      marginBottom: 12,
      background: "var(--card)",
    }}>
      <div style={{ padding: 16, minHeight }}>{children}</div>
      <div style={{ borderTop: "1px solid var(--border)", background: "color-mix(in oklch, var(--muted) 30%, transparent)", padding: "8px 12px" }}>
        <code style={{ fontSize: "12px", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>{code}</code>
      </div>
    </div>
  );
}

/** A small labelled swatch used as demo content. */
function Tile({ children, full }: { children?: React.ReactNode; full?: boolean }) {
  return (
    <div style={{
      background: "color-mix(in oklch, var(--primary) 15%, transparent)",
      border: "1px solid color-mix(in oklch, var(--primary) 35%, transparent)",
      borderRadius: "var(--radius-md, 6px)",
      padding: "10px 14px",
      fontSize: "12px",
      fontWeight: 600,
      color: "var(--primary)",
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
      background: "var(--muted)",
      color: "var(--foreground)",
      border: "1px solid var(--border)",
    }}>
      {children}
    </code>
  );
}

const GAP_SCALE = ["0", "px", "0.5", "1", "1.5", "2", "3", "4", "6", "8"];

export function UtilitiesPage() {
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
          Layout utilities
        </h1>
        <p style={{
          marginTop: 12,
          maxWidth: "44rem",
          fontSize: "14.5px",
          lineHeight: 1.6,
          color: "var(--muted-foreground)",
        }}>
          Canvas lays out with a Tailwind-style utility vocabulary passed as a
          {" "}<Chip>className</Chip>. The engine resolves it to a React Native style for the active theme and
          viewport, so the same utilities work on iOS, Android, and the web. Layout is flexbox: React Native has
          no CSS grid, so there are no grid utilities. On the web the same vocabulary is also generated as Tailwind
          v4 CSS through <Chip>canvas.css</Chip>.
        </p>
      </section>

      <Section
        title="How it works"
        description="className -> the engine (useStyles) -> a resolved React Native style; primitives render style={[resolved, style]}, so a caller-supplied style always wins. The same path runs on native and on react-native-web."
        anatomy="Responsive prefixes are desktop-first: the unprefixed utility is the desktop base, and a prefixed utility (sm/md/lg/xl/2xl) applies at that width AND BELOW, with the smallest matching breakpoint winning. This is the inverse of mobile-first. Breakpoints (and below): sm 640, md 768, lg 1024, xl 1280, 2xl 1536."
      >
        <div className="flex flex-wrap gap-2" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Chip>flex</Chip><Chip>flex-row</Chip><Chip>md:flex-col</Chip><Chip>lg:gap-2</Chip>
          <Chip>md:hidden</Chip><Chip>xl:w-1/2</Chip>
        </div>
      </Section>

      <Section title="Display & direction" description="flex turns on a flex container; hidden removes it. React Native defaults a flex container to a column, so set flex-row for a row (plus flex-row-reverse, flex-col, flex-wrap).">
        <Demo code='<View className="flex flex-row items-center gap-3">'>
          <View className="flex flex-row items-center gap-3">
            <Tile>flex-row</Tile><Tile>item</Tile><Tile>item</Tile>
          </View>
        </Demo>
        <Demo code='<View className="flex flex-col gap-2">'>
          <View className="flex flex-col gap-2">
            <Tile>flex-col</Tile><Tile>stacks</Tile><Tile>vertically</Tile>
          </View>
        </Demo>
      </Section>

      <Section title="Alignment" description="justify-* controls the main axis; items-* the cross axis. Plus self-* for a single child, and grow / shrink.">
        <Demo code='<View className="flex flex-row justify-between items-center gap-3">'>
          <View className="flex flex-row justify-between items-center gap-3">
            <Tile>start</Tile><Tile>middle</Tile><Tile>end</Tile>
          </View>
        </Demo>
        <Demo code='<View className="flex flex-row justify-center gap-2">'>
          <View className="flex flex-row justify-center gap-2">
            <Tile>centered</Tile><Tile>row</Tile>
          </View>
        </Demo>
      </Section>

      <Section
        title="Gap"
        description="gap, gap-x, and gap-y across the spacing scale. Each maps to a value in Tailwind's 4px-based scale (gap-4 = 16px), the same scale padding and margin use."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {GAP_SCALE.map((v) => (
            <div key={v} style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 12px",
              border: "1px dashed var(--border)",
              borderRadius: "var(--radius-md, 6px)",
            }}>
              <span style={{ width: 84, flexShrink: 0 }}><Chip>gap-{v}</Chip></span>
              <View className={`flex flex-row gap-${v}`}>
                <Tile> </Tile><Tile> </Tile><Tile> </Tile>
              </View>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Flex sizing" description="flex-1 makes a child fill the remaining space; grow / shrink / flex-none tune how children flex. Combine with the sizing utilities below.">
        <Demo code='<View className="flex flex-row gap-2"> ... <View className="flex-1">'>
          <View className="flex flex-row gap-2">
            <Tile>auto</Tile>
            <View className="flex-1"><Tile full>flex-1 fills the rest</Tile></View>
            <Tile>auto</Tile>
          </View>
        </Demo>
      </Section>

      <Section title="Sizing" description="w / h take the spacing scale, fractions (w-1/2, w-1/3), full (100%), auto, or an arbitrary value (w-[200px]). min-w / max-w / min-h / max-h and size-* round it out.">
        <Demo code='<View className="flex flex-row gap-2"> ... w-1/2 / w-1/4'>
          <View className="flex flex-row gap-2">
            <View className="w-1/2"><Tile full>w-1/2</Tile></View>
            <View className="w-1/4"><Tile full>w-1/4</Tile></View>
            <View className="w-1/4"><Tile full>w-1/4</Tile></View>
          </View>
        </Demo>
        <Demo code='<View className="w-full"> / <View className="w-40">'>
          <View className="flex flex-col gap-2">
            <View className="w-full"><Tile full>w-full</Tile></View>
            <View className="w-40"><Tile full>w-40 (160px)</Tile></View>
          </View>
        </Demo>
      </Section>

      <Section
        title="Responsive (desktop-first)"
        description="Prefix any utility with a breakpoint. Because the model is desktop-first, a prefixed utility applies at that width and BELOW. Resize the window across the md (768px) boundary to watch these change."
      >
        <Demo code='<View className="flex flex-row md:flex-col gap-3">'>
          <View className="flex flex-row md:flex-col gap-3">
            <Tile>a row on desktop</Tile><Tile>that stacks at md</Tile><Tile>and below</Tile>
          </View>
        </Demo>
        <Demo code='<View className="flex md:hidden"> / <View className="hidden md:flex">'>
          <View className="flex flex-row items-center gap-3">
            <View className="flex md:hidden"><Tile>wide screens only</Tile></View>
            <View className="hidden md:flex"><Tile>md and below only</Tile></View>
          </View>
        </Demo>
      </Section>

      <Section
        title="Precedence & overrides"
        description="Within one className, a higher-priority utility wins for the same property (state > dark > breakpoint > base, smaller breakpoint first). And because every primitive renders style={[resolved, style]}, a caller-supplied style always wins over the className."
        anatomy="Below, w-40 sets a fixed 160px width; the inline style={{ width: '100%' }} overrides it, because the resolved className style is applied first and the caller style last."
      >
        <Demo code={'<View className="w-40" /> vs <View className="w-40" style={{ width: "100%" }} />'}>
          <View className="flex flex-col gap-3">
            <View className="w-40"><Tile full>w-40, 160px</Tile></View>
            <View className="w-40" style={{ width: "100%" }}><Tile full>w-40 + style width 100%, style wins</Tile></View>
          </View>
        </Demo>
      </Section>

      <PageNav />
    </div>
  );
}
