// The audit plan's checklists as data: the universal rubric applied to every component,
// the family checklists layered on top, and each component's own row from the plan's
// per-component tables (its families, the native shape it is owed per
// PLATFORM-REFERENCES.md, and its specific checks and known gaps). The checklist
// generator (tools/audit/checklists.ts) seeds a component's hand-maintained sections
// from here ONCE, on its first write, so the seed is reproducible from this file rather
// than from a prose document. Edit a shipped checklist in place; change this file to
// change what a NEW checklist starts with.

import { materialCoverage } from "../materials/manifest.ts";

export type Family =
  | "actions"
  | "selection"
  | "text-entry"
  | "pickers"
  | "menus-overlays"
  | "navigation"
  | "data-display"
  | "feedback"
  | "media-identity"
  | "layout"
  | "rearrangement"
  | "charts"
  | "pages";

export const FAMILY_LABEL: Record<Family, string> = {
  actions: "Actions",
  selection: "Selection controls",
  "text-entry": "Text entry",
  pickers: "Pickers",
  "menus-overlays": "Menus and overlays",
  navigation: "Navigation",
  "data-display": "Data display",
  feedback: "Feedback",
  "media-identity": "Media and identity",
  layout: "Layout primitives",
  rearrangement: "Rearrangement",
  charts: "Charts",
  pages: "Patterns and templates",
};

export interface RubricItem {
  title: string;
  /** S = source or test read, A = accessibility tree or DOM probe, P = photograph, N = native device check. */
  evidence: string;
  text: string;
}

/** The world-class checklist: the universal rubric, applied to every component. */
export const UNIVERSAL_RUBRIC: RubricItem[] = [
  {
    title: "API and anatomy",
    evidence: "S",
    text: "style choices are flat booleans on documented axes; precedence documented in the component's `.md` (today only 7 of 104 do); `children` + `description` label anatomy for indicator controls; controlled and uncontrolled both work; ref forwarded on focusables; `testID`, `displayName`; `LayoutStyle` only, no style hatch.",
  },
  {
    title: "Dark Factory fidelity on the web",
    evidence: "P, S",
    text: "radii (control 8, field 10, menu/tile 12, card 14, dialog 18, sheet 22, pill), DF type roles and the 12/11/10 floors, `primary` violet for selection, `action` green for CTA, elevation ladder, hover lifts from `HOVER`, nested corners never rounder than the container, one icon stroke (1.75), tabular numerals. Compared side by side with the DF `/ui` playground where DF has the component.",
  },
  {
    title: "Platform truth",
    evidence: "P, N, S",
    text: "where `PLATFORM-REFERENCES.md` cites a real control, the iOS skin matches HIG and the Android skin matches M3 metrics (`platforms.css` and `lookout.rubric.md`: sizes, radii, type role, press dim 0.8 vs ripple, disabled 0.4 vs 0.38); elsewhere the native skin IS the DF look aliasing the web skin; \"one job, different control\" substitutions are in place and injected as parts; `check:skins` and `tools/skins/divergence.ts` tell the truth.",
  },
  {
    title: "States",
    evidence: "P, A",
    text: "default, hover (web), pressed, focus-visible (2 px ring, offset 2, or the field's own border), disabled, read-only, loading, error/invalid, selected/checked/mixed, open/expanded, empty, overflow (long text, many items), each legible in every look and surface.",
  },
  {
    title: "Accessibility",
    evidence: "A, S, N",
    text: "role, name and state with dual `aria-*` aliases; keyboard model matching the WAI-ARIA APG pattern Radix implements (Tab stop, Space on keyup, Enter, roving arrows + Home/End, typeahead where APG has it, Escape via the escape layer, focus trap and return); touch targets 44 pt / 48 dp via hitSlop; contrast 4.5:1 text and 3:1 non-text in blush, mint, dark and glass; live regions; Reduce Motion, Reduce Transparency, Increase Contrast; RTL mirroring; text scaling to 200% without clipping; VoiceOver and TalkBack names from the native accessibility tree.",
  },
  {
    title: "Responsive and form factor",
    evidence: "P, A",
    text: "correct sizing nature (FILL/HUG/layout), a MeasureProps step where a field width matters, no horizontal overflow at 390/768/1280, container measurement not window reads, phone substitutions (overlays become sheets), long-content truncation with the full text still announced, no one-word orphans.",
  },
  {
    title: "Materials",
    evidence: "P, S",
    text: "the right glass layer, solid mode byte-identical, glass legible, Reduce Transparency falls back to the opaque token.",
  },
  {
    title: "Motion",
    evidence: "S, P",
    text: "only the allowed functional motion, 100 to 700 ms, reduced motion honored, hover web-only; anything judged by eye goes through the tuning harness.",
  },
  {
    title: "Docs and content",
    evidence: "S, P; Polaris bar",
    text: "`.md` has Usage, Variants covering every axis prop and state, Do and Don't, precedence, accessibility and keyboard notes; every prop has JSDoc; examples are kit-only; content guidance (sentence case, verb-first buttons); no `.md` section is silently dropped by the generator.",
  },
  {
    title: "Tests",
    evidence: "S",
    text: "a behavior test, `a11y-state` coverage, per-OS skin smoke, touch-target coverage, open-state e2e and axe for overlays, visual baselines.",
  },
  {
    title: "Performance",
    evidence: "S",
    text: "nothing commits through React per frame; long lists window; memoization where a measured cost exists.",
  },
];

/** The family checklists, added on top of the universal rubric. */
export const FAMILY_CHECKLISTS: Record<Family, string[]> = {
  actions: ["APG button and toggle button", "loading keeps width and sets busy", "icon-only needs a name", "links behave as links"],
  selection: ["APG checkbox, radio group, switch, slider, spinbutton", "group labelling", "required and error"],
  "text-entry": [
    "label, helper, error, counter wired to `aria-describedby` / `aria-invalid`",
    "autofill and keyboard types (`oneTimeCode`, `tel`, `email`)",
    "secure entry",
    "IME",
    "keyboard avoidance and return-key flow on native",
  ],
  pickers: ["APG combobox, listbox, grid", "typeahead", "disabled options skipped", "async loading and empty", "phone sheet"],
  "menus-overlays": [
    "APG menu, dialog, alertdialog, tooltip (WCAG 1.4.13 hoverable, dismissable, persistent)",
    "scrim",
    "scroll lock",
    "safe areas",
    "hardware back",
    "edge placement",
    "phone sheets",
    "one Escape owner",
  ],
  navigation: ["`aria-current`", "APG tabs", "overflow", "drawer modes at breakpoints", "RTL arrows"],
  "data-display": ["list/table semantics", "`aria-sort`", "selection", "windowing", "stacked phone layouts", "not-color-only deltas"],
  feedback: ["live region politeness", "information-bearing motion kept under reduced motion", "busy state"],
  "media-identity": ["alternative text or decorative hiding", "captions and keyboard transport for Video", "QR stays scannable (dark on light) in every look"],
  layout: ["the sizing contracts in `CLAUDE.md`", "SSR first frame", "RTL", "scroll focus"],
  rearrangement: ["a keyboard alternative to drag", "announcements", "touch long-press"],
  charts: [
    "data reachable without sight (label or data table)",
    "keyboard access to inspection",
    "series not color-only with 3:1 and colorblind separation",
    "tabular numerals",
    "phone-width axis density",
    "empty/loading/negative/null data",
    "legend toggles by keyboard",
    "locale number formats",
  ],
  pages: ["kit-only composition", "three widths", "keyboard-complete flows", "realistic content"],
};

export interface ComponentPlan {
  slug: string;
  families: Family[];
  /**
   * The native shape owed per `PLATFORM-REFERENCES.md`, iOS / Android: HIG keeps the iOS
   * control's shape, M3 the Material 3 shape, DF means the native skin is the DF look and
   * should alias the web skin.
   */
  native: string;
  /** The specific checks and known gaps from the plan's row. */
  specifics: string[];
}

const CHART_NATIVE = "shared skin on every platform";

/** Every component page's row from the plan's four tier tables. */
export const COMPONENT_PLANS: ComponentPlan[] = [
  // Atoms
  { slug: "autocomplete", families: ["pickers"], native: "text field and menu (one job, different control, K8c) / M3", specifics: ["APG combobox (`aria-activedescendant`, Escape clears then closes)", "M3 exposed dropdown on Android", "phone sheet", "async loading/empty", "long options"] },
  {
    slug: "avatar",
    families: ["media-identity", "menus-overlays"],
    native: "DF / DF",
    specifics: [
      "initials contrast conflict (DF 1.8 to 2.5:1 vs 4.5) resolved and recorded",
      "image fallback",
      "overlap and +N",
      "AvatarMenu opened in e2e/axe (K6)",
      "divergence misreport (K4)",
      "metric gap: diameter scale one step high",
    ],
  },
  { slug: "badge", families: ["data-display"], native: "DF / DF (neither platform ships a label pill; the iOS and M3 badges are count dots)", specifics: ["named badge role (`img` vs `group`)", "soft-wash contrast in all looks and glass", "BadgeGroup tests (K7)"] },
  { slug: "breadcrumb", families: ["navigation"], native: "DF / DF (own skins until this turn aliases them, K8b)", specifics: ["`aria-current`", "`maxItems` collapse menu by keyboard", "RTL chevrons", "link targets 44/48", "phone truncation", "smoke-only tests (K7)"] },
  {
    slug: "button",
    families: ["actions"],
    native: "HIG / M3",
    specifics: ["iOS capsule 44, 17/600, dim 0.8", "M3 40 dp + 48 target, 14/500, ripple", "DF pill 12/700 (CTA 800), 1 px hover lift", "loading width and busy", "`href` links", "dropped doc sections (K2)"],
  },
  { slug: "button-group", families: ["actions"], native: "HIG / M3", specifics: ["iOS segmented", "M3 Expressive connected group", "DF segmented", "held state", "split overflow menu dense", "roving arrows"] },
  { slug: "checkbox", families: ["selection"], native: "switch on iOS / M3 18 dp", specifics: ["one-job substitution via parts", "indeterminate `mixed`", "error", "description anatomy"] },
  { slug: "chip", families: ["actions"], native: "DF / M3", specifics: ["M3 chip 32 dp, 8 corners, 16 padding, label-large, selected filter chip leads with a check", "remove button named and 44/48", "`aria-pressed` toggle"] },
  { slug: "container", families: ["layout"], native: "n/a", specifics: ["measure steps and `start`"] },
  { slug: "divider", families: ["layout"], native: "HIG / M3", specifics: ["vertical in Row", "inset", "decorative hidden", "smoke-only tests (K7)"] },
  { slug: "dropdown", families: ["menus-overlays"], native: "HIG / M3", specifics: ["APG menu with typeahead", "iOS menu radius and row 44", "M3 menu 4 dp, 48 rows", "phone presentation", "edge placement", "RTL"] },
  { slug: "emblem", families: ["media-identity"], native: "DF / DF", specifics: ["tones", "sizes", "maps to the \"icon-tile\" reference row"] },
  { slug: "grid", families: ["layout"], native: "n/a", specifics: ["`minTileWidth` + `columns`", "container measured", "SSR first frame"] },
  { slug: "icon", families: ["media-identity"], native: "shared", specifics: ["stroke 1.75", "decorative vs named", "RTL mirroring of directional glyphs", "sizes track text"] },
  { slug: "image", families: ["media-identity"], native: "n/a", specifics: ["fit booleans", "loading and error placeholder", "alt or decorative", "no tests at all (K7)"] },
  {
    slug: "input",
    families: ["text-entry"],
    native: "HIG / M3",
    specifics: ["iOS 44 r8", "M3 56 r4 filled/outlined", "DF 48 r10", "floating label", "clear", "secure entry", "autofill", "open gaps helper, password, validation set", "metric gap `wide` 896 vs 480"],
  },
  { slug: "input-otp", families: ["text-entry"], native: "DF / DF (own skins until this turn aliases them, K8b)", specifics: ["paste whole code", "one-time-code autofill (iOS `oneTimeCode`, Android SMS)", "per-cell announcement", "error"] },
  { slug: "kbd", families: ["actions"], native: "shared", specifics: ["platform modifier glyphs (Cmd vs Ctrl)", "contrast"] },
  { slug: "row-column", families: ["layout"], native: "n/a", specifics: ["gap names", "`stacks`", "`span`", "boolean alignment", "RTL"] },
  { slug: "listbox", families: ["pickers"], native: "trailing checks / M3 checkboxes", specifics: ["single vs multi aria", "native `list` role", "disabled skipped", "typeahead", "long lists scroll"] },
  { slug: "pagination", families: ["navigation"], native: "DF / DF", specifics: ["`aria-current` page", "ellipsis", "compact phone mode", "rows-per-page", "RTL arrows", "resting-control targets"] },
  { slug: "popover", families: ["menus-overlays"], native: "HIG / DF", specifics: ["nonmodal focus", "Escape", "phone sheet", "arrow and edge placement"] },
  { slug: "pressable", families: ["actions"], native: "platform feedback", specifics: ["focus ring", "dim vs ripple vs tint", "tab stop"] },
  { slug: "progress", families: ["feedback"], native: "HIG / M3", specifics: ["determinate value aria", "indeterminate sweep on the loop primitive", "label and value text"] },
  { slug: "qrcode", families: ["media-identity"], native: "n/a", specifics: ["dark modules on light in every look (scannable)", "quiet zone", "label carries the payload", "smoke-only (K7)"] },
  { slug: "radio", families: ["selection"], native: "checkmark list / M3 20 dp", specifics: ["roving arrows", "required and error", "description anatomy"] },
  { slug: "reveal", families: ["layout"], native: "n/a", specifics: ["reduced motion", "RTL"] },
  { slug: "scroll-view", families: ["layout"], native: "primitive", specifics: ["scroll-focus ring", "indicators"] },
  { slug: "select", families: ["pickers"], native: "HIG / M3", specifics: ["iOS pop-up button menu", "M3 exposed dropdown 56", "phone sheet", "typeahead", "open gap helper", "metric gap `wide`"] },
  { slug: "skeleton", families: ["feedback"], native: "DF / DF", specifics: ["shimmer on the loop primitive", "static under reduced motion", "container busy"] },
  { slug: "slider", families: ["selection"], native: "HIG / M3", specifics: ["full keyboard model", "value label", "RTL", "ticks", "disabled"] },
  { slug: "spinner", families: ["feedback"], native: "HIG / M3", specifics: ["activity indicator vs M3 (Expressive) loading indicator", "label", "kept under reduced motion"] },
  { slug: "stepper", families: ["selection"], native: "HIG / DF (own Android skin until this turn aliases it, K8c)", specifics: ["APG spinbutton", "decimal", "min/max ends disabled", "long-press repeat", "adjustable actions"] },
  { slug: "swatch", families: ["media-identity"], native: "n/a", specifics: ["border on near-background colors", "name"] },
  { slug: "switch", families: ["selection"], native: "HIG / M3", specifics: ["iOS 26/27 switch metrics re-measured against the UI kit", "M3 52x32 with thumb icon option", "DF 44x24", "Space on keyup", "label wrap"] },
  { slug: "text", families: ["layout"], native: "primitive", specifics: ["fonts", "focus ring on TextInput", "RTL"] },
  { slug: "text-input", families: ["layout"], native: "primitive", specifics: ["fonts", "focus ring on TextInput", "RTL"] },
  { slug: "view", families: ["layout"], native: "primitive", specifics: ["fonts", "focus ring on TextInput", "RTL"] },
  { slug: "textarea", families: ["text-entry"], native: "HIG / M3", specifics: ["autosize", "counter live region", "open gap helper", "metric gap `wide`"] },
  { slug: "tooltip", families: ["menus-overlays"], native: "DF / M3", specifics: ["WCAG 1.4.13", "hover and focus triggers", "long-press on touch", "never opened in e2e (K6)", "open gaps `reveal`, `brisk`"] },
  { slug: "typography", families: ["layout"], native: "shared", specifics: ["DF scale and floors", "heading levels", "truncation", "Dynamic Type"] },
  { slug: "video", families: ["media-identity"], native: "AVKit player controls / Media3 player controls", specifics: ["keyboard transport", "captions track (WCAG 1.2.2)", "poster", "no autoplay under reduced motion"] },

  // Molecules
  { slug: "accordion", families: ["data-display"], native: "HIG / DF (own Android skin until this turn aliases it, K8c)", specifics: ["APG accordion (button inside heading)", "single and multiple", "reduced motion"] },
  { slug: "action-panels", families: ["data-display"], native: "DF / DF (own skins until this turn aliases them, K8b; the platform Button, Switch and Card parts stay)", specifics: ["phone stacking", "smoke-only tests (K7)"] },
  { slug: "alert", families: ["feedback"], native: "DF / DF", specifics: ["`alert` vs `status` by tone", "named dismiss", "title/description anatomy", "toned wash contrast"] },
  { slug: "alert-dialog", families: ["menus-overlays"], native: "HIG / M3", specifics: ["APG alertdialog", "iOS centered alert", "M3 28 dp with right-aligned text actions", "initial focus on the least destructive action"] },
  { slug: "card", families: ["data-display"], native: "DF (own iOS skin until this turn aliases it, K8c) / M3", specifics: ["M3 card 12", "web 14 with 2 px hover lift", "one tap target and focus when pressable", "media slot"] },
  { slug: "code-block", families: ["data-display"], native: "shared", specifics: ["mono font per platform (Menlo on iOS)", "copy action", "focusable horizontal scroll", "syntax contrast in all looks"] },
  { slug: "collapsible", families: ["data-display"], native: "HIG / DF (own Android skin until this turn aliases it, K8c)", specifics: ["disclosure semantics", "reduced motion"] },
  { slug: "description-lists", families: ["data-display"], native: "HIG / DF (own Android skin until this turn aliases it, K8c)", specifics: ["container breakpoint switch", "web `dl` semantics", "long values wrap"] },
  { slug: "empty-state", families: ["feedback"], native: "DF / DF (own skins until this turn aliases them, K8b; the platform Button part stays)", specifics: ["composition", "decorative illustration hidden", "one primary action"] },
  { slug: "feeds", families: ["data-display"], native: "DF / DF (own skins until this turn aliases them, K8b)", specifics: ["list semantics", "timeline connector", "full date announced"] },
  { slug: "field", families: ["text-entry"], native: "HIG / M3 (the control is the wrapped field's)", specifics: ["label, description, error, required wired for every control it wraps"] },
  { slug: "form", families: ["text-entry"], native: "HIG / DF (own Android skin until this turn aliases it, K8c)", specifics: ["grouped sections", "validation summary", "return-key next", "keyboard avoidance"] },
  { slug: "grid-lists", families: ["data-display"], native: "HIG / DF (own Android skin until this turn aliases it, K8c)", specifics: ["container breakpoints", "tile selection"] },
  { slug: "media-objects", families: ["data-display"], native: "DF / DF (own skins until this turn aliases them, K8b)", specifics: ["alignment", "RTL", "smoke-only tests (K7)"] },
  { slug: "phone-input", families: ["text-entry"], native: "HIG / M3", specifics: ["E.164", "`tel` autofill", "dense country list", "missing from skins smoke (K5)"] },
  { slug: "stacked-lists", families: ["data-display"], native: "HIG / M3", specifics: ["iOS inset grouped list", "M3 list items 56/72/88", "keyboard reorder", "open gaps `headerAction`, `selectedId`"] },
  { slug: "stats", families: ["data-display"], native: "DF / DF (own skins until this turn aliases them, K8b)", specifics: ["tabular numerals", "deltas carry sign and icon, not color only (WCAG 1.4.1)"] },

  // Organisms
  { slug: "action-sheet", families: ["menus-overlays"], native: "HIG / M3 modal bottom sheet (one job, different control, K8c)", specifics: ["grabber", "safe area", "hardware back", "cancel row"] },
  { slug: "board", families: ["rearrangement"], native: "DF / DF (own skins until this turn aliases them, K8c)", specifics: ["keyboard move between columns", "announcements", "column scroll"] },
  { slug: "calendar", families: ["pickers"], native: "HIG / M3", specifics: ["APG grid navigation", "locale first day", "range", "disabled dates", "today vs selected"] },
  { slug: "carousel", families: ["data-display"], native: "page control (one job, different control, K8c) / M3", specifics: ["APG carousel (\"n of m\", pause)", "arrows beside slides", "swipe"] },
  { slug: "command", families: ["pickers"], native: "DF / DF (own skins until this turn aliases them, K8b)", specifics: ["APG combobox + listbox", "embedded mode", "phone full sheet", "groups", "empty text"] },
  { slug: "dashboard-grid", families: ["rearrangement"], native: "DF / DF", specifics: ["keyboard rearrange", "spans", "SSR"] },
  { slug: "data-table", families: ["data-display"], native: "HIG / DF (own Android skin until this turn aliases it, K8c)", specifics: ["`aria-sort`", "selection", "sticky header", "horizontal scroll", "phone stacks", "loading/empty", "windowing", "open gap `footer`"] },
  { slug: "dialog", families: ["menus-overlays"], native: "HIG / M3", specifics: ["APG modal dialog", "phone sheet or full screen", "keyboard avoidance", "scrolling body", "opt-in backdrop dismissal"] },
  { slug: "drag-drop", families: ["rearrangement"], native: "DF / DF (own skins until this turn aliases them, K8c; the grip keeps the platform touch target)", specifics: ["keyboard drag", "live announcements", "touch long-press"] },
  { slug: "drawer", families: ["menus-overlays"], native: "HIG / M3", specifics: ["swipe dismiss", "RTL side", "open gaps `title`, `description`, `footer`"] },
  { slug: "filter-panel", families: ["navigation"], native: "sheet with checkmark rows (one job, different control, K8c) / M3", specifics: ["drawer mode at its breakpoint", "counts", "clear all"] },
  { slug: "navbars", families: ["navigation"], native: "HIG / M3", specifics: ["iOS bar 44 with large title", "M3 top app bar 64", "narrow modes collapse to a menu"] },
  { slug: "row-menu", families: ["menus-overlays"], native: "HIG / M3", specifics: ["APG menu", "trigger named for its row"] },
  { slug: "sidebar", families: ["navigation"], native: "HIG / M3", specifics: ["`aria-current`", "drawer at breakpoint", "drill-down", "collapse"] },
  { slug: "steps", families: ["navigation"], native: "DF / DF (own skins until this turn aliases them, K8b)", specifics: ["`aria-current` step", "vertical on phone"] },
  {
    slug: "tab-bar",
    families: ["navigation"],
    native: "HIG / M3",
    specifics: ["iOS floating Liquid Glass bar", "M3 navigation bar 80", "badges", "open gaps `searchKey`, `accessory`, `minimizeBehavior`, `minimized`, `scrollRef`"],
  },
  { slug: "tabs", families: ["navigation"], native: "DF / M3 (the iOS build is the web capsule skin)", specifics: ["APG tabs (automatic vs manual activation)", "M3 underline", "overflow scroll"] },
  { slug: "toast", families: ["feedback"], native: "DF / M3 snackbar", specifics: ["polite live region", "enough time and pause on hover/focus (WCAG 2.2.1)", "inline action", "swipe dismiss", "stacking"] },

  // Charts (every chart inherits the chart family checklist; shared skin on every platform)
  { slug: "chart", families: ["charts"], native: CHART_NATIVE, specifics: ["open gaps `crosshair`, `valueLabels`, `unit`, `bare`", "ChartFrame (absent, K11): build the public chart wrapper the hand-off specifies"] },
  { slug: "line-chart", families: ["charts"], native: CHART_NATIVE, specifics: ["open gaps `crosshair`, `valueLabels`, `unit`, `bare`"] },
  { slug: "area-chart", families: ["charts"], native: CHART_NATIVE, specifics: ["stacked and negative values", "open gap `bare` (Area)"] },
  { slug: "range-area-chart", families: ["charts"], native: CHART_NATIVE, specifics: ["stacked and negative values", "open gap `bare` (Area)"] },
  { slug: "composed-chart", families: ["charts"], native: CHART_NATIVE, specifics: ["stacked and negative values", "open gap `bare` (Area)"] },
  { slug: "histogram", families: ["charts"], native: CHART_NATIVE, specifics: ["stacked and negative values", "open gap `bare` (Area)"] },
  { slug: "box-plot", families: ["charts"], native: CHART_NATIVE, specifics: ["stacked and negative values", "open gap `bare` (Area)"] },
  { slug: "waterfall-chart", families: ["charts"], native: CHART_NATIVE, specifics: ["stacked and negative values", "open gap `bare` (Area)"] },
  { slug: "scatter-plot", families: ["charts"], native: CHART_NATIVE, specifics: ["open gaps `xTitle`, `yTitle`, `trend`, `bare`"] },
  { slug: "candlestick-chart", families: ["charts"], native: CHART_NATIVE, specifics: ["up/down not color only", "open gaps `subtitle`, `lastPrice`, `crosshair`, `bare`"] },
  { slug: "depth-chart", families: ["charts"], native: CHART_NATIVE, specifics: ["no dedicated tests (K7)", "open gaps `mid`, `subtitle`, `crosshair`, `bare`"] },
  { slug: "bar-list", families: ["charts"], native: CHART_NATIVE, specifics: ["label truncation at phone width", "status not color only"] },
  { slug: "bullet-chart", families: ["charts"], native: CHART_NATIVE, specifics: ["label truncation at phone width", "status not color only"] },
  { slug: "funnel-chart", families: ["charts"], native: CHART_NATIVE, specifics: ["label truncation at phone width", "status not color only"] },
  { slug: "radar-chart", families: ["charts"], native: CHART_NATIVE, specifics: ["label truncation at phone width", "status not color only"] },
  { slug: "treemap", families: ["charts"], native: CHART_NATIVE, specifics: ["label truncation at phone width", "status not color only"] },
  { slug: "metric-breakdown", families: ["charts"], native: CHART_NATIVE, specifics: ["label truncation at phone width", "status not color only"] },
  { slug: "service-health-list", families: ["charts"], native: CHART_NATIVE, specifics: ["label truncation at phone width", "status not color only"] },
  { slug: "uptime-bar", families: ["charts"], native: CHART_NATIVE, specifics: ["inline sizing", "StackedBar open gaps `totals`, `unit`, `bare`"] },
  { slug: "sparkline", families: ["charts"], native: CHART_NATIVE, specifics: ["inline sizing", "StackedBar open gaps `totals`, `unit`, `bare`"] },
  { slug: "stacked-bar", families: ["charts"], native: CHART_NATIVE, specifics: ["inline sizing", "StackedBar open gaps `totals`, `unit`, `bare`"] },
  { slug: "pie-chart", families: ["charts"], native: CHART_NATIVE, specifics: ["fixed `size` vs the parent-provides-bounds rule", "Pie open gaps `subtitle`, `centerLabel`, `centerValue`, `sliceLabels`, `unit`"] },
  { slug: "radial-bar-chart", families: ["charts"], native: CHART_NATIVE, specifics: ["fixed `size` vs the parent-provides-bounds rule", "Pie open gaps `subtitle`, `centerLabel`, `centerValue`, `sliceLabels`, `unit`"] },
  { slug: "progress-ring", families: ["charts"], native: CHART_NATIVE, specifics: ["fixed `size` vs the parent-provides-bounds rule", "Pie open gaps `subtitle`, `centerLabel`, `centerValue`, `sliceLabels`, `unit`"] },
  { slug: "gauge", families: ["charts"], native: CHART_NATIVE, specifics: ["fixed 120 px root (`gauge.shared.tsx:45`) breaks \"a component never dictates its own width\"", "open gap `size`"] },
  { slug: "heatmap", families: ["charts"], native: CHART_NATIVE, specifics: ["focusable horizontal scroll", "open gaps `startDay`, `subtitle`"] },
  { slug: "geo-map", families: ["charts"], native: CHART_NATIVE, specifics: ["camera and cluster by keyboard", "region names announced"] },
];

/** A component's plan row, or null for a page the plan has no row for. */
export function planFor(slug: string): ComponentPlan | null {
  return COMPONENT_PLANS.find((plan) => plan.slug === slug) ?? null;
}

/**
 * The style-layer renderables with no component page of their own, so no checklist file:
 * the material inventory's style tier less the primitives whose docs route is a component
 * page (View, Text and the rest). Derived, not kept by hand: tools/materials/manifest.ts
 * records each one's docs route, check:api holds that route to the public API manifest's
 * (the documenting page, or none while PENDING_DOCS stages it), and
 * tools/audit/checklists.test.ts holds the audit/README.md line that lists them to this.
 */
export const STYLE_LAYER_RENDERABLES: readonly string[] = materialCoverage
  .filter((entry) => entry.tier === "style" && !entry.docsRoute?.startsWith("components/"))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

/** The design tokens' foundation: the `tokens/*` docs pages, beside the style-layer renderables. */
export const TOKENS_FOUNDATION = "Tokens";

/**
 * The kit internals the generated `/foundation` reference page documents (K12-10 OD2): the
 * public names the API manifest documents or plans there that no renderable and not the
 * design tokens hold, each a deprecated alias to come (K12-2). The Foundations tier carries
 * the 111 deprecations, so every one of them is on one of its checklists.
 */
export const REFERENCE_FOUNDATION = "FoundationReference";

/**
 * The universal rubric adapted for a style-layer contract (the Foundations tier): a
 * foundation has no variants of its own, it is a contract other components render
 * through, so each item asks what the contract promises and what it must never break for
 * the components in its Capture through list.
 */
export const FOUNDATION_RUBRIC: RubricItem[] = [
  {
    title: "API and contract",
    evidence: "S",
    text: "the contract its consumers rely on is stated in its source and JSDoc (what it renders, what it never renders, its defaults); every export carries a JSDoc summary; no style escape hatch beyond a layout-only `style`; K12-2: each internal-by-accident export becomes a deprecated alias that keeps working and names the kit component to use, and a public one keeps working unchanged; nothing removed before a major.",
  },
  {
    title: "Docs",
    evidence: "S, P",
    text: "the page the public API manifest (`tools/api/manifest.ts`) names for each export documents it, or its planned K12 page does once built (`theming`, `integration`, `tokens/*`, the generated `/foundation` reference of K12-10); every deprecated name is listed with its replacement; no page presents an internal helper as API; examples on those pages are kit-only.",
  },
  {
    title: "Platform truth",
    evidence: "S, N, P",
    text: "one contract on iOS, Android and the web; the platform builds of its modules agree on the API; on iOS and Android it uses the platform's own machinery (Liquid Glass through `expo-glass-effect`, the frosted blur, hardware back, the ripple, the native driver), never a web emulation; the web hand-off CSS never feeds a native build.",
  },
  {
    title: "Materials",
    evidence: "S, P",
    text: "its role in `tools/materials/manifest.ts` holds; solid mode is byte-identical to the pre-glass tree; Reduce Transparency and Increase Contrast fall back to the opaque token; no glass is hand-painted outside `GlassSurface` and `GlassPane`.",
  },
  {
    title: "Accessibility it provides or must not break",
    evidence: "A, S, N",
    text: "what it adds to the accessibility tree (roles, hiding, live regions, focus trap and return, the escape layer) is right on every platform, and what its consumers put there survives it untouched; Reduce Motion, Reduce Transparency and Increase Contrast honoured; touch-target slop never clipped; RTL mirrored; VoiceOver and TalkBack read its consumers' names.",
  },
  {
    title: "Performance",
    evidence: "S",
    text: "nothing commits through React per frame; subscriptions re-render at bucket granularity; context values are stable between renders; no layout read per frame; memoization only where a measured cost exists.",
  },
  {
    title: "Tests",
    evidence: "S",
    text: "a test of its own contract, beside its consumers' tests; the solid-mode byte identity where it paints; its per-OS behaviour; the design-rule tests that hold it (`test/design-rules-*.test.ts`).",
  },
];

/**
 * Each foundation's specific checks: the plan's row, the owner's decisions in
 * `audit/DECISIONS.md` that concern it, and the target its `tools/materials/manifest.ts`
 * entry records. The checklist generator seeds a foundation's checklist from here once;
 * every foundation also gets the consumers line below.
 */
export const FOUNDATION_PLANS: Readonly<Record<string, readonly string[]>> = {
  AnchoredOverlay: [
    "gains the placement option P3e needs (above and beside its anchor), shipped in the same minor as Popover's real `top` anchoring (P3e)",
    "edge placement and flipping at every width, inside the window's safe area",
    "the dense option lists through `dense`, and the public `opaque` prop's behaviour kept (materials target)",
  ],
  BreakpointOverride: [
    "K12-6: documented on `tokens/layout` with the responsive hooks and the sizing and width vocabulary",
    "keeps the responsive preview context the docs' three-up renders each platform row in (materials target)",
  ],
  Entrance: [
    "a readiness hold for an overlay card: invisible and inert until its owner is ready, then shown in place with no transform (materials target)",
    "no motion of its own, after the 2026-09-21 removal of the Entrance spring",
  ],
  FloatingLabel: [
    "labels, the required marker, the focus and value transitions and the error contrast stay stable over glass wells; no material per label (materials target)",
    "the floating transition within 100 to 700 ms, still under Reduce Motion",
  ],
  GlassModalBlurTarget: [
    "K12-5: documented on `integration` as the Modal blur bridge for an app hosting its own React Native Modal",
    "a safe target bridge that keeps separate-window ownership, exercised with ActionSheet and Drawer over native content (materials target)",
  ],
  GlassPane: [
    "renders nothing where its host resolves solid (`useMaterialResolution`), so no default black border or second hairline: the Android re-capture of chip, badge, kbd, switch, input, card, alert, checkbox, radio and steps is still pending (audit/README.md, Native spike)",
    "P3a: Android in-page glass resolves solid (`missing-target`), so the Android glass column equals solid outside overlays",
    "decoration behind a semantic host: the missing-renderer fallback keeps the host's full surface contract, and the material choice agrees with the parent's fill suppression (materials target)",
  ],
  GlassSurface: [
    "centralizes renderer, density, clipping, accessibility and platform capability resolution, with its public props kept compatible (materials target)",
    "the web's plain frost judged against the `df-frost` card through the tuning harness (`/testing/materials`)",
    "the layers' legibility floors and solid byte identity held by `test/glass-tint.test.tsx`, `test/glass-controls.test.tsx` and `test/dense-overlays.test.tsx`",
  ],
  LabelContent: [
    "labels, the required marker and the error contrast stay stable over glass wells; no material per label (materials target)",
    "the required marker announced once, not read as a stray asterisk",
  ],
  LayoutAxisProvider: [
    "the layout-axis context HUG resolves against (`alignSelf: \"flex-start\"` inside a stretching Column and nothing anywhere else), stable across renders (CLAUDE.md, Sizing)",
    "semantic layout context and sizing kept stable (materials target)",
  ],
  LoopView: [
    "the loop primitive: the native driver natively and a compositor CSS animation on the web, nothing committed through React per frame (`loop-native.ts` holds the primitive's one `Animated.loop`; `test/design-rules-source.test.ts` holds every file that loops to `supportsNativeDriver` and one timing per loop)",
    "the Skeleton shimmer, the one effect that renders through it (Skeleton, and DataTable's loading rows through it: its Capture through list), still under Reduce Motion, where the shimmer is decoration and an animated Skeleton mounts no loop",
    "source: the Spinner, the indeterminate Progress sweep and the InputOTP caret drive their own `Animated.loop` (`src/atoms/spinner/spinner.shared.tsx`, `src/atoms/progress/progress.shared.tsx`, `src/atoms/input-otp/input-otp.shared.tsx`), not LoopView, though CLAUDE.md's Motion section puts them on the loop primitive and the materials target names the Spinner and the Progress: whether they move onto it or the doc and the target are corrected is the owner's question; their pictures are their own turns'",
  ],
  OverlayProvider: [
    "K12-5: documented on `integration` (overlay hosting); OD6: its `style` prop documented as app-frame only",
    "owns placement, native ordering and safe backdrop contexts, with the unhosted fallback kept (materials target)",
  ],
  Portal: [
    "owns placement, native ordering and safe backdrop contexts, with the unhosted fallback kept (materials target)",
    "content portaled out of a Modal or a sheet keeps its focus order and its escape layer",
  ],
  RippleClip: [
    "the native bounded ripple and the surface radii kept, with content never unclipped (materials target)",
    "the hover read on the RippleClip wrapper, which never moves, so a lifted surface cannot slide out from under a resting pointer (`src/style/hover.tsx`)",
  ],
  ThemeProvider: [
    "stays public (K12-2); K12-3 and K12-4: the ThemeProvider reference on `theming`: reading the theme, the palette axis and the accessibility preferences",
    "the boolean grammar: `glass` wins over `solid`, `dark` over `light` and over `mint`; neither surface given resolves to glass on iOS 26+ and solid everywhere else",
    "resolves the glass and solid mode, the preferences and the tokens without changing precedence or defaults (materials target)",
  ],
  [REFERENCE_FOUNDATION]: [
    "K12-2: every export here becomes a deprecated alias that keeps working and names the kit component or token to use (the owner's decision: all 111, nothing removed before a major)",
    "K12-2 OD5: React Native's `StyleSheet` pass-through deprecated, since it invites raw styling (`useWindowDimensions`, the other pass-through, is BreakpointOverride's)",
    "K12-2 tabular: Typography's `tabular` boolean ships (a minor) before `tabularNums` is deprecated, so apps keep tabular figures",
    "K12-10 OD2: the generated `/foundation` reference page lists every deprecated name with its replacement, the foundations' internals included, and no page presents an internal helper as API",
    "every export here carries a JSDoc summary and its `@deprecated` note naming the replacement",
  ],
  [TOKENS_FOUNDATION]: [
    "K12-7: the colors, spacing and shape, typography and layout references on the `tokens/*` pages name every token set and type they document",
    "K12-7 OD3: `fontSize`, `fontWeight`, `lineHeight` and `letterSpacing` (the Riskora ladder nothing reads) deprecated, pointing to Typography's roles",
    "K12-2 OD4: `shadow`, `customShadow` and `ShadowLevel` deprecated, elevation coming from Card's appearances; the Elevation section of `/tokens/spacing`, which renders `shadow`, moved to the replacement",
    "Dark Factory's tokens on every platform: violet `primary` for selection, the green `action` role for calls to action, blush, mint and DF's one dark palette, Manrope at DF's dense sizes with the 12, 11 and 10 floors",
    "K9: one source of truth for the iOS checkbox's check radius (`DESIGN.md`'s generated 11 against `shape.ios.checkbox` 5 in `src/style/tokens.ts`)",
    "K10: no stale Riskora comments in `styles/tokens/platforms.css`; the web hand-off (`styles/tokens/*.css`) mirrors `src/style/tokens.ts`",
  ],
};

/** The check every foundation carries: its consumers re-captured, as the plan's "no regressions left for later turns" asks. */
export const FOUNDATION_CONSUMERS_CHECK =
  "every component and page in its Capture through list is re-captured before and after a change (`bun run audit:turn -- --slug=<foundation> --phase=before|after`), and a consumer already signed off gets a re-sign-off row when its pictures change";

/** The pages' plan: the patterns and templates family checklist plus their one specific. */
export const PAGE_PLAN = {
  families: ["pages"] as Family[],
  specifics: ["all looks"],
};
