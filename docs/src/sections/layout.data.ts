// The Layout section page's tables (`Canvas v4.0.0 Layout.dc.html`): the sizing contract by
// component family, and the responsive card's preset widths. Plain data with no React
// import. The sizing rows follow CLAUDE.md's sizing contract (FILL: fields, cards, alerts,
// lists, tables, charts, feeds, forms, the calendar; HUG: Button, Badge, Chip, Kbd,
// ButtonGroup, Dropdown, Tooltip, QRCode, Stepper, InputOTP; only the layout containers
// carry widths), and every floor or height a row names is the kit's own value: the
// Button heights (button.styles.ts), the Stats tile floor (stats.styles.ts), Form's
// two-column item floor (form.styles.ts) and DataTable's scroll floor
// (data-table.styles.ts). A floor or cap the kit does not set reads "—".

import type { WidthKey } from "@nannier/canvas";

/** How a family takes its width (the hand-off's legend). */
export type SizingMode = "fill" | "hug" | "fixed" | "tiles";

export const SIZING_MODES: readonly { mode: SizingMode; note: string }[] = [
  { mode: "fill", note: "stretches to the bounds it is given" },
  { mode: "hug", note: "sizes to its content" },
  { mode: "fixed", note: "intrinsic, never stretches" },
  { mode: "tiles", note: "auto-fit by a minimum tile width" },
];

export interface SizingRow {
  family: string;
  members: string;
  mode: SizingMode;
  height: string;
  floor: string;
  cap: string;
  reflows: string;
}

export const SIZING: readonly SizingRow[] = [
  { family: "Controls", members: "Button · ButtonGroup · Chip · Badge · Kbd", mode: "hug", height: "32 · 40 · 48", floor: "—", cap: "—", reflows: "Labels never truncate. block turns a hug control into a fill." },
  { family: "Marks", members: "Switch · Checkbox · Radio · Avatar · Icon · Emblem", mode: "fixed", height: "own size", floor: "—", cap: "—", reflows: "Never reflow; the shape stays put." },
  { family: "Fields", members: "Input · Select · Textarea · Autocomplete · PhoneInput", mode: "fill", height: "40 · Textarea grows", floor: "—", cap: "a measure step", reflows: "Addons and icons stay; the value column absorbs the change." },
  { family: "Surfaces", members: "Card · Alert · ActionPanel · EmptyState · MediaObject", mode: "fill", height: "hug content", floor: "—", cap: "—", reflows: "Content wraps inside the bounds it is given." },
  { family: "Tiles", members: "Grid · Stats · GridList · DashboardGrid", mode: "tiles", height: "hug", floor: "minTileWidth · Stats 150", cap: "columns · span", reflows: "As many equal columns as fit. Spans reflow to narrowSpan, then stack." },
  { family: "Forms", members: "Form · Field · DescriptionList", mode: "fill", height: "hug", floor: "200 a column", cap: "a measure step", reflows: "Two columns where they fit; stacked otherwise." },
  { family: "Data", members: "DataTable · StackedList · Calendar · Board", mode: "fill", height: "hug · scrolls", floor: "DataTable 320", cap: "—", reflows: "Table rows stack below their breakpoint. Board columns scroll sideways." },
  { family: "Charts", members: "every chart type", mode: "fill", height: "fixed or aspect", floor: "—", cap: "—", reflows: "The plot measures its own width; the legend wraps." },
  { family: "Navigation", members: "Navbar · Tabs · Breadcrumb · Pagination · Steps", mode: "fill", height: "fixed", floor: "—", cap: "—", reflows: "Links fold into a menu when compact; a scrolling bar slides sideways." },
  { family: "Shells", members: "Sidebar · FilterPanel · AppFrame · Page", mode: "fixed", height: "fill", floor: "—", cap: "page step", reflows: "Viewport tier: a rail above lg, a drawer at and below it." },
  { family: "Overlays", members: "Dialog · Drawer · Popover · ActionSheet · Wizard", mode: "fill", height: "hug · body scrolls", floor: "—", cap: "their own step", reflows: "Viewport tier: a bottom sheet on phones." },
];

/** The responsive card's presets: the simulated window bucket and the Container step. */
export interface ResizePreset {
  label: string;
  icon: "smartphone" | "tablet" | "monitor" | "maximize2";
  /** The Container step that caps the mini app (none for Fit). */
  step?: WidthKey;
  /** The viewport bucket the subtree resolves (null: the real window). */
  bucket: "sm" | "lg" | "base" | null;
}

export const RESIZE_PRESETS: readonly ResizePreset[] = [
  { label: "Phone", icon: "smartphone", step: "sm", bucket: "sm" },
  { label: "Tablet", icon: "tablet", step: "xxxl", bucket: "lg" },
  { label: "Desktop", icon: "monitor", step: "widest", bucket: "base" },
  { label: "Fit", icon: "maximize2", bucket: null },
];

/** The gap scale (Row and Column), narrowest first: each name's spacing-token step, the
 *  same steps src/atoms/layout/layout.styles.ts maps them to. */
export const GAP_SCALE: readonly { name: "flush" | "tight" | "snug" | "cozy" | "relaxed" | "loose"; step: "0" | "1" | "2" | "3" | "4" | "6" }[] = [
  { name: "flush", step: "0" },
  { name: "tight", step: "1" },
  { name: "snug", step: "2" },
  { name: "cozy", step: "3" },
  { name: "relaxed", step: "4" },
  { name: "loose", step: "6" },
];

/** The Container steps the card samples (the hand-off's six of the thirteen). */
export const SAMPLED_STEPS: readonly WidthKey[] = ["xxs", "sm", "lg", "xxl", "wide", "page"];
