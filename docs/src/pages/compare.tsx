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
type Ref = { url: string; img?: string; note?: string } | null;
type Entry = { slug: string; name: string; level: string; refs: Record<Platform, Ref> };

// CDN bases for the hotlinked reference screenshots (the real control images served
// by each design system; Apple + Android allow cross-origin <img> hotlinking). Catalyst
// (web) renders its components as HTML with no image asset, so web stays a link.
const AND = "https://developer.android.com/static/develop/ui/compose/images";
const IOS = "https://docs-assets.developer.apple.com/published";

// The platform-skinned components (extend as more are skinned). `url` = the reference
// doc from PLATFORM-REFERENCES.md; `img` = a hotlinked screenshot of the real control.
const ENTRIES: Entry[] = [
  { slug: "button", name: "Button", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/button", img: `${AND}/components/button-filled.png` },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/buttons", img: `${IOS}/a28d01e0e86313ce083d5db066815a5a/components-buttons-thumbnail%402x.png` },
    web: { url: "https://catalyst.tailwindui.com/docs/button" } } },
  { slug: "checkbox", name: "Checkbox", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/checkbox", img: `${AND}/components/checkbox-minimal-checked.png` },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/toggles", img: `${IOS}/ffd72e78175dc69a27016e8454030b71/checkbox-deselected%402x.png`, note: "no native iOS checkbox" },
    web: { url: "https://catalyst.tailwindui.com/docs/checkbox" } } },
  { slug: "radio", name: "Radio", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/radio-button", img: `${AND}/components/radiobutton2.png` },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/pickers", img: `${IOS}/91c45b3934ecd18b42b2bb72e64ca702/radio-button-selected%402x.png`, note: "no native iOS radio" },
    web: { url: "https://catalyst.tailwindui.com/docs/radio" } } },
  { slug: "switch", name: "Switch", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/switch", img: `${AND}/components/switch.png` },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/toggles", img: `${IOS}/f4a1d653777ba4f0b6b4b7d97d704f9f/components-toggles-intro%402x.png` },
    web: { url: "https://catalyst.tailwindui.com/docs/switch" } } },
  { slug: "input", name: "Input", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/text/user-input", img: `${AND}/text-textfield-hello.png` },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/text-fields", img: `${IOS}/76a27a49c4c007b35b9564e1efc83446/components-text-field-intro%402x.png` },
    web: { url: "https://catalyst.tailwindui.com/docs/input" } } },
  { slug: "textarea", name: "Textarea", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/text/user-input", img: `${AND}/text-textfield-multiline.png` },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/text-views", img: `${IOS}/43a1eb50d986f3b2dc0765b6beca6ae9/components-text-views-thumbnail%402x.png` },
    web: { url: "https://catalyst.tailwindui.com/docs/textarea" } } },
  { slug: "button-group", name: "Button Group (segmented)", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/segmented-button", img: `${AND}/components/SingleChoiceSegmentedButton.png` },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/segmented-controls", img: `${IOS}/f82bafe0f162b0181f6d50661109464b/segmented-controls-activity-charts%402x.png` },
    web: { url: "https://ui.shadcn.com/docs/components/toggle-group" } } },
  { slug: "select", name: "Select", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/menu", img: `${AND}/components/basicmenu1.png` },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/pickers", img: `${IOS}/65d6693bf614da95dde6a82006037c86/pickers-date-picker-compact-expanded%402x.png` },
    web: { url: "https://catalyst.tailwindui.com/docs/select" } } },
  { slug: "combobox", name: "Combobox", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/menu", img: `${AND}/components/MinimalDropdownMenu.png` },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/combo-boxes", img: `${IOS}/34898e39063208aa3706d50629eb3ad3/components-combobox-intro%402x.png` },
    web: { url: "https://catalyst.tailwindui.com/docs/combobox" } } },
  { slug: "dropdown", name: "Dropdown", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/menu", img: `${AND}/components/basicmenu1.png` },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/menus", img: `${IOS}/004bc60431be4d2765469b56e47d4781/menus-groups-visual-treatment%402x.png` },
    web: { url: "https://catalyst.tailwindui.com/docs/dropdown" } } },
  { slug: "row-menu", name: "Row Menu (context menu)", level: "organisms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/menu", img: `${AND}/components/basicmenu1.png` },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/context-menus", img: `${IOS}/a330aca1a1e1f0dc65837ecb74014561/components-context-menu-intro%402x.png` },
    web: { url: "https://www.radix-ui.com/primitives/docs/components/context-menu" } } },
  { slug: "popover", name: "Popover", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/menu", note: "no native Material popover" },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/popovers", img: `${IOS}/ef05d3cb071e4c11209cce39b596ca99/attached-popover%402x.png` },
    web: { url: "https://ui.shadcn.com/docs/components/popover" } } },
  { slug: "tooltip", name: "Tooltip", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/tooltip", img: `${AND}/PlainTooltipExample.png` },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/", note: "no native iOS tooltip" },
    web: { url: "https://www.radix-ui.com/primitives/docs/components/tooltip" } } },
  { slug: "dialog", name: "Dialog", level: "organisms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/dialog", img: `${AND}/components/dialog-alert.png` },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/sheets", img: `${IOS}/56b1f2417f35468434a5cb9bb0ea6653/components-sheet-intro%402x.png` },
    web: { url: "https://catalyst.tailwindui.com/docs/dialog" } } },
  { slug: "alert-dialog", name: "Alert Dialog", level: "molecules", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/dialog", img: `${AND}/components/dialog-alert.png` },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/alerts", img: `${IOS}/e74ac90d149b111c3f2c7d21e3484100/components-alert-intro%402x.png` },
    web: { url: "https://ui.shadcn.com/docs/components/alert-dialog" } } },
  { slug: "overlays", name: "Overlays (sheet / drawer)", level: "organisms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/bottom-sheets", img: `${AND}/layouts/material/m3-bottom-sheet.png` },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/sheets", img: `${IOS}/56b1f2417f35468434a5cb9bb0ea6653/components-sheet-intro%402x.png` },
    web: { url: "https://ui.shadcn.com/docs/components/sheet" } } },
  { slug: "spinner", name: "Spinner", level: "atoms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/progress", note: "M3 circular progress" },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/progress-indicators", img: `${IOS}/6c1e23fcc6e04603423dacd5df6c48a3/progress-indicator-intermediate-spinner%402x.png` },
    web: { url: "https://www.radix-ui.com/primitives/docs/components/progress" } } },
  { slug: "tabs", name: "Tabs", level: "organisms", refs: {
    android: { url: "https://developer.android.com/develop/ui/compose/components/tabs", img: `${AND}/primary-secondary-tab.png` },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/tab-bars", img: `${IOS}/29a93bc69eaa415e2e3d5440474a8d36/tab-bar-badges-iphone%402x.png` },
    web: { url: "https://headlessui.com/react/tabs" } } },
  { slug: "pagination", name: "Pagination (light touch)", level: "atoms", refs: {
    android: { url: "https://m3.material.io/components", note: "no Material pagination" },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/page-controls", note: "iOS uses dot page controls" },
    web: { url: "https://catalyst.tailwindui.com/docs/pagination" } } },
  { slug: "stepper", name: "Stepper (light touch)", level: "organisms", refs: {
    android: { url: "https://m3.material.io/components", note: "no Material 3 stepper" },
    ios: { url: "https://developer.apple.com/design/human-interface-guidelines/", note: "no native iOS stepper" },
    web: { url: "https://tailwindui.com/components/application-ui/navigation/steps" } } },
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
  // Prefer the hotlinked CDN screenshot; fall back to a locally-dropped image, then a link.
  const src = ref?.img ?? `/refs/${slug}-${platform}.png`;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
      {!errored ? (
        <img src={src} alt={`${slug} ${platform} reference`} onError={() => setErrored(true)}
          style={{ maxWidth: "100%", maxHeight: 150, borderRadius: 8, border: "1px solid var(--border)", background: "#fff" }} />
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
