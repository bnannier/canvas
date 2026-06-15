import { View, useResponsive } from "@olympusoss/canvas";
import { Link } from "react-router-dom";
import { PageNav } from "@/components/page-nav";

/**
 * The layout guide. Canvas lays out with plain React Native style objects on the
 * raw View primitive (flexbox), so the demos here render real <View> elements
 * with the same style objects a consumer writes, and double as a live smoke test.
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

/** A live demo box: renders the children, then shows the style used. */
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

// The spacing scale (Tailwind's 4px base) as the px values gap/padding/margin take.
const GAP_SCALE: Array<[string, number]> = [
  ["0", 0], ["px", 1], ["0.5", 2], ["1", 4], ["1.5", 6], ["2", 8], ["3", 12], ["4", 16], ["6", 24], ["8", 32],
];

// useResponsive is a hook, so the responsive demo lives in its own component.
// It collapses from a row on desktop to a column at the md breakpoint and below.
function ResponsiveDemo() {
  const direction = useResponsive<"row" | "column">({ base: "row", md: "column" });
  return (
    <View style={{ flexDirection: direction, gap: 12 }}>
      <Tile>a row on desktop</Tile><Tile>that stacks at md</Tile><Tile>and below</Tile>
    </View>
  );
}

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
          Layout & flexbox
        </h1>
        <p style={{
          marginTop: 12,
          maxWidth: "44rem",
          fontSize: "14.5px",
          lineHeight: 1.6,
          color: "var(--muted-foreground)",
        }}>
          Canvas lays out with plain React Native style objects on the raw
          {" "}<Chip>View</Chip> primitive, so the same code runs on iOS, Android, and the web. Layout is flexbox:
          React Native has no CSS grid. The spacing scale is Tailwind's 4px base expressed as numbers
          ({" "}<Chip>gap: 16</Chip> is Tailwind's <Chip>gap-4</Chip>), and the <Chip>useResponsive</Chip> hook
          handles breakpoints, so a value can change with the viewport.
        </p>
        <p style={{ marginTop: 10, fontSize: "13px", color: "var(--muted-foreground)" }}>
          New to the building blocks? See{" "}
          <Link to="/rn-primitives" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>React Native primitives</Link>{" "}
          for View, Text, and the rest of the primitives this guide composes.
        </p>
      </section>

      <Section
        title="How layout works"
        description="A View is a flex container; you set its layout with a style object (flexDirection, alignItems, justifyContent, gap, ...). Numbers are density-independent pixels. A style array merges left to right, so the last entry wins, which is how a component's style escape-hatch prop overrides its own layout."
        anatomy="Responsive values come from useResponsive({ base, sm, md, ... }), which is desktop-first: base is the desktop value, and a breakpoint entry applies at that width AND BELOW, with the smallest matching breakpoint winning. This is the inverse of mobile-first. Breakpoints (and below): sm 640, md 768, lg 1024, xl 1280, 2xl 1536."
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Chip>flexDirection: "row"</Chip><Chip>alignItems: "center"</Chip><Chip>gap: 8</Chip>
          <Chip>flex: 1</Chip><Chip>width: "50%"</Chip>
        </div>
      </Section>

      <Section title="Display & direction" description="React Native defaults a View to a column, so set flexDirection: 'row' for a row. There is no display:flex toggle (every View is already a flex container); use display:'none' to hide.">
        <Demo code={'<View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>'}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Tile>row</Tile><Tile>item</Tile><Tile>item</Tile>
          </View>
        </Demo>
        <Demo code={'<View style={{ flexDirection: "column", gap: 8 }}>'}>
          <View style={{ flexDirection: "column", gap: 8 }}>
            <Tile>column</Tile><Tile>stacks</Tile><Tile>vertically</Tile>
          </View>
        </Demo>
      </Section>

      <Section title="Alignment" description="justifyContent controls the main axis; alignItems the cross axis. Use alignSelf for a single child, and flexGrow / flexShrink to tune how children flex.">
        <Demo code={'<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>'}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <Tile>start</Tile><Tile>middle</Tile><Tile>end</Tile>
          </View>
        </Demo>
        <Demo code={'<View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>'}>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>
            <Tile>centered</Tile><Tile>row</Tile>
          </View>
        </Demo>
      </Section>

      <Section
        title="Gap"
        description="gap (and columnGap / rowGap) takes a number from the spacing scale. The same scale backs padding and margin, so a layout reads in one vocabulary: gap: 16 is Tailwind's gap-4."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {GAP_SCALE.map(([label, px]) => (
            <div key={label} style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 12px",
              border: "1px dashed var(--border)",
              borderRadius: "var(--radius-md, 6px)",
            }}>
              <span style={{ width: 96, flexShrink: 0 }}><Chip>gap: {px}</Chip></span>
              <View style={{ flexDirection: "row", gap: px }}>
                <Tile> </Tile><Tile> </Tile><Tile> </Tile>
              </View>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Flex sizing" description="flex: 1 makes a child fill the remaining space; flexGrow / flexShrink / flexBasis tune how children flex. Combine with the sizing properties below.">
        <Demo code={'<View style={{ flexDirection: "row", gap: 8 }}> ... <View style={{ flex: 1 }}>'}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Tile>auto</Tile>
            <View style={{ flex: 1 }}><Tile full>flex: 1 fills the rest</Tile></View>
            <Tile>auto</Tile>
          </View>
        </Demo>
      </Section>

      <Section title="Sizing" description="width / height take a number (px), a percentage string ('50%', '100%'), or 'auto'. minWidth / maxWidth / minHeight / maxHeight round it out. There are no fraction utilities: write the percentage you want.">
        <Demo code={'<View style={{ flexDirection: "row", gap: 8 }}> ... width: "50%" / "25%"'}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ width: "50%" }}><Tile full>width 50%</Tile></View>
            <View style={{ width: "25%" }}><Tile full>25%</Tile></View>
            <View style={{ width: "25%" }}><Tile full>25%</Tile></View>
          </View>
        </Demo>
        <Demo code={'<View style={{ width: "100%" }}> / <View style={{ width: 160 }}>'}>
          <View style={{ flexDirection: "column", gap: 8 }}>
            <View style={{ width: "100%" }}><Tile full>width 100%</Tile></View>
            <View style={{ width: 160 }}><Tile full>width 160</Tile></View>
          </View>
        </Demo>
      </Section>

      <Section
        title="Responsive (desktop-first)"
        description="useResponsive({ base, md, ... }) returns the active value for the viewport. Because the model is desktop-first, a breakpoint entry applies at that width and BELOW. Resize the window across the md (768px) boundary to watch this change."
      >
        <Demo code={'const direction = useResponsive({ base: "row", md: "column" });'}>
          <ResponsiveDemo />
        </Demo>
      </Section>

      <Section
        title="Composing styles"
        description="Pass an array of style objects and the later entries win, the same merge React Native uses. Every Canvas component also takes a style prop applied last, so a caller can nudge layout (a margin, a width) without restyling the component."
        anatomy="Below, the base sets a fixed 160px width; the second entry in the array overrides it to 100%, because a style array is applied left to right and the last value wins."
      >
        <Demo code={'<View style={[{ width: 160 }, { width: "100%" }]} />'}>
          <View style={{ flexDirection: "column", gap: 12 }}>
            <View style={{ width: 160 }}><Tile full>width 160</Tile></View>
            <View style={[{ width: 160 }, { width: "100%" }]}><Tile full>[160, 100%] -&gt; last wins</Tile></View>
          </View>
        </Demo>
      </Section>

      <PageNav />
    </div>
  );
}
