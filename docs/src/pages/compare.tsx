import { useState } from "react";
import { LiveExampleFor } from "@/components/live-example";

// QA harness: for each platform-skinned component, put our live Canvas render beside
// the real platform reference, per platform, in a table (rows = Android / iOS / Web,
// columns = Canvas | Reference). Use the global topbar light/dark + Solid toggles to
// check both schemes. Reference images live in docs/public/refs/<slug>-<platform>.png
// (gitignored, captured from the iOS HIG / Material 3 / Catalyst links in
// PLATFORM-REFERENCES.md); a missing image falls back to a link to the reference.

const RAW = import.meta.glob("../../../src/*/*/*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

type Platform = "android" | "ios" | "web";
type Ref = { url: string; note?: string } | null;
type Entry = { slug: string; name: string; level: string; refs: Record<Platform, Ref> };

// The platform-skinned components (extend as more are skinned), each with its
// reference URL per platform from PLATFORM-REFERENCES.md. `null` = no native equivalent.
const ENTRIES: Entry[] = [
  { slug: "button", name: "Button", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/button" },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/buttons" },
    web: { url: "https://catalyst.tailwindui.com/docs/button" } } },
  { slug: "checkbox", name: "Checkbox", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/checkbox" },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/toggles", note: "no native iOS checkbox" },
    web: { url: "https://catalyst.tailwindui.com/docs/checkbox" } } },
  { slug: "radio", name: "Radio", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/radio-button" },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/pickers", note: "no native iOS radio" },
    web: { url: "https://catalyst.tailwindui.com/docs/radio" } } },
  { slug: "switch", name: "Switch", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/switch" },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/toggles" },
    web: { url: "https://catalyst.tailwindui.com/docs/switch" } } },
  { slug: "input", name: "Input", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/text/user-input" },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/text-fields" },
    web: { url: "https://catalyst.tailwindui.com/docs/input" } } },
  { slug: "textarea", name: "Textarea", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/text/user-input" },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/text-views" },
    web: { url: "https://catalyst.tailwindui.com/docs/textarea" } } },
  { slug: "button-group", name: "Button Group (segmented)", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/segmented-button" },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/segmented-controls" },
    web: { url: "https://ui.shadcn.com/docs/components/toggle-group" } } },
  { slug: "select", name: "Select", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/menu" },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/pickers" },
    web: { url: "https://catalyst.tailwindui.com/docs/select" } } },
  { slug: "combobox", name: "Combobox", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/menu" },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/combo-boxes" },
    web: { url: "https://catalyst.tailwindui.com/docs/combobox" } } },
];

const PLATFORMS: Platform[] = ["android", "ios", "web"];
const PLATFORM_LABEL: Record<Platform, string> = { android: "Android (Material 3)", ios: "iOS (HIG)", web: "Web (Catalyst)" };

// Pull the first ```tsx fence under "## Usage" from a component's markdown.
function usageFence(md: string): string {
  const at = md.indexOf("## Usage");
  if (at === -1) return "";
  const m = /```tsx\n([\s\S]*?)```/.exec(md.slice(at));
  return m ? m[1].trim() : "";
}

function RefCell({ slug, platform, ref }: { slug: string; platform: Platform; ref: Ref }) {
  const [errored, setErrored] = useState(false);
  const src = `/refs/${slug}-${platform}.png`;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
      {!errored ? (
        <img src={src} alt={`${slug} ${platform} reference`} onError={() => setErrored(true)}
          style={{ maxWidth: "100%", maxHeight: 120, borderRadius: 8, border: "1px solid var(--border)" }} />
      ) : (
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          {ref?.note ? `${ref.note}. ` : ""}reference image not captured yet
        </span>
      )}
      {ref && (
        <a href={ref.url} target="_blank" rel="noreferrer" style={{ fontSize: 11.5, color: "var(--primary)" }}>
          ↗ {ref.note ? ref.note : "reference"}
        </a>
      )}
    </div>
  );
}

export function ComparePage() {
  return (
    <div>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.015em", color: "var(--foreground)" }}>
          Platform comparison
        </h1>
        <p style={{ marginTop: 6, fontSize: "13.5px", color: "var(--muted-foreground)", maxWidth: 720, lineHeight: 1.6 }}>
          Each skinned component's live Canvas render beside the real platform reference, per
          platform. Toggle light/dark and Solid/Glass in the topbar. A row's Canvas must match its
          Reference, and the three rows must look distinct.
        </p>
      </header>

      {ENTRIES.map((e) => {
        const md = RAW[`../../../src/${e.level}/${e.slug}/${e.slug}.md`] ?? "";
        const code = usageFence(md);
        return (
          <section key={e.slug} style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ margin: "0 0 0.75rem", fontSize: 18, fontWeight: 600, color: "var(--foreground)" }}>{e.name}</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <thead>
                <tr>
                  <th style={th(140)}>Platform</th>
                  <th style={th()}>Canvas</th>
                  <th style={th()}>Reference</th>
                </tr>
              </thead>
              <tbody>
                {PLATFORMS.map((p) => (
                  <tr key={p}>
                    <td style={{ ...td, fontSize: 13, fontWeight: 600, color: "var(--foreground)", verticalAlign: "middle" }}>
                      {PLATFORM_LABEL[p]}
                    </td>
                    <td style={td}>
                      <div style={{ display: "flex", alignItems: "center", minHeight: 56, padding: 12, borderRadius: 8, background: "var(--card)", border: "1px solid var(--border)" }}>
                        {code ? <LiveExampleFor code={code} platform={p} /> : <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>no usage example</span>}
                      </div>
                    </td>
                    <td style={td}><RefCell slug={e.slug} platform={p} ref={e.refs[p]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}

function th(width?: number): React.CSSProperties {
  return { width, textAlign: "left", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--muted-foreground)", padding: "6px 10px", borderBottom: "1px solid var(--border)" };
}
const td: React.CSSProperties = { padding: "12px 10px", borderBottom: "1px solid var(--border)", verticalAlign: "top" };
