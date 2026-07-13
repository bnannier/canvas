import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { Text } from "react-native";
import { ThemeProvider } from "../src/style/theme.tsx";

// Skin smoke test — the ONLY layer that loads the per-OS *.ios.tsx / *.android.tsx
// skin files. Every other suite imports the base `<name>.tsx` (the web build), so a
// skin that references a missing token, mis-shapes a StyleSheet, or throws at render
// on iOS or Android alone would ship untested. Here we dynamically import BOTH the
// iOS and the Android build of every skinned component and render each once inside
// ThemeProvider, asserting the export exists and the mount does not throw.
//
// Data-driven: one row per exported component, keyed by its directory + file base +
// export name, with the minimal props needed to render its body. We import the skin
// file by a variable path (../src/<dir>/<file>.<platform>.tsx) — bun resolves the
// react-native -> react-native-web alias transitively through the dynamic import,
// exactly as the static suites get it — and render with React.createElement so a
// single loop covers ~130 mounts without hand-writing each JSX case.
//
// Deliberately NOT covered here: `useToast` (a hook, not a renderable component — it
// is exercised via ToastProvider below and in components-extra.test.tsx). StackedBar,
// Gauge, and Heatmap live in the platform-neutral charts-viz.tsx but are re-exported
// from the charts skin files, so importing them through the skin still loads and
// mounts them per platform.

afterEach(cleanup);

/** Wrap raw strings in <Text> so View-only panels (Drawer, ToastProvider) are legal RN. */
const txt = (s: string) => createElement(Text, null, s);
const noop = () => {};

type Kids = ReactNode | ((mod: Record<string, unknown>) => ReactNode);

interface SkinCase {
  /** Exported symbol to render (also the test's display name). */
  name: string;
  /** Component directory under src/, e.g. "atoms/avatar". */
  dir: string;
  /** File base name — the part before `.ios.tsx` / `.android.tsx`. */
  file: string;
  /** Minimal props satisfying the component's required props and rendering a body. */
  props?: Record<string, unknown>;
  /** Children; a function receives the resolved module (for AvatarGroup's Avatars). */
  children?: Kids;
}

const CASES: SkinCase[] = [
  // ---- atoms ----
  { name: "Avatar", dir: "atoms/avatar", file: "avatar", children: "AB" },
  {
    name: "AvatarGroup",
    dir: "atoms/avatar",
    file: "avatar",
    props: { max: 2 },
    children: (mod) => [
      createElement(mod.Avatar as never, { key: "a" }, "AB"),
      createElement(mod.Avatar as never, { key: "b" }, "CD"),
      createElement(mod.Avatar as never, { key: "c" }, "EF"),
    ],
  },
  { name: "Badge", dir: "atoms/badge", file: "badge", children: "New" },
  { name: "Breadcrumb", dir: "atoms/breadcrumb", file: "breadcrumb", props: { items: ["Home", "Library", "Data"] } },
  { name: "BreadcrumbItem", dir: "atoms/breadcrumb", file: "breadcrumb", props: { current: true }, children: "Home" },
  { name: "ButtonGroup", dir: "atoms/button-group", file: "button-group", props: { items: ["Day", "Week", "Month"], active: 0 } },
  { name: "Button", dir: "atoms/button", file: "button", children: "Save" },
  { name: "Checkbox", dir: "atoms/checkbox", file: "checkbox", props: { checked: false }, children: "Accept" },
  { name: "Chip", dir: "atoms/chip", file: "chip", children: "Filter" },
  { name: "Combobox", dir: "atoms/combobox", file: "combobox", props: { options: ["Apple", "Banana"], open: true } },
  { name: "Divider", dir: "atoms/divider", file: "divider" },
  { name: "Dropdown", dir: "atoms/dropdown", file: "dropdown", props: { label: "Menu", items: [{ label: "One" }, { label: "Two" }] } },
  { name: "IconTile", dir: "atoms/icon-tile", file: "icon-tile", props: { label: "AB", primary: true } },
  { name: "Icon", dir: "atoms/icon", file: "icon", props: { check: true } },
  { name: "InputOTP", dir: "atoms/input-otp", file: "input-otp", props: { value: "12", length: 6, onChange: noop } },
  { name: "Input", dir: "atoms/input", file: "input", props: { placeholder: "Email" } },
  { name: "Kbd", dir: "atoms/kbd", file: "kbd", children: "K" },
  { name: "Row", dir: "atoms/layout", file: "layout", children: txt("row") },
  { name: "Column", dir: "atoms/layout", file: "layout", children: txt("col") },
  { name: "Listbox", dir: "atoms/listbox", file: "listbox", props: { items: [{ label: "One", selected: true }, { label: "Two" }] } },
  { name: "NumberInput", dir: "atoms/number-input", file: "number-input", props: { value: 3, min: 0, max: 10, onChange: noop } },
  { name: "Pagination", dir: "atoms/pagination", file: "pagination", props: { page: 1, total: 5, onChange: noop } },
  // `inline` renders the popover card body directly (no trigger click needed).
  { name: "Popover", dir: "atoms/popover", file: "popover", props: { inline: true, title: "Title", description: "Body", actionLabel: "OK" } },
  { name: "Progress", dir: "atoms/progress", file: "progress", props: { value: 0.6 } },
  { name: "QRCode", dir: "atoms/qrcode", file: "qrcode", props: { value: "https://example.com" } },
  { name: "Radio", dir: "atoms/radio", file: "radio", props: { checked: false }, children: "Option" },
  { name: "Select", dir: "atoms/select", file: "select", props: { options: ["A", "B", "C"], value: "A", open: true } },
  { name: "Skeleton", dir: "atoms/skeleton", file: "skeleton" },
  { name: "Slider", dir: "atoms/slider", file: "slider", props: { value: 40, min: 0, max: 100 } },
  { name: "Sparkline", dir: "atoms/sparkline", file: "sparkline", props: { values: [1, 3, 2, 5, 4, 6] } },
  { name: "Spinner", dir: "atoms/spinner", file: "spinner" },
  { name: "Switch", dir: "atoms/switch", file: "switch", props: { checked: true }, children: "Wi-Fi" },
  { name: "Textarea", dir: "atoms/textarea", file: "textarea", props: { placeholder: "Notes" } },
  // `open` renders the tip bubble body.
  { name: "Tooltip", dir: "atoms/tooltip", file: "tooltip", props: { label: "Tip", trigger: "Hover", open: true } },
  { name: "Typography", dir: "atoms/typography", file: "typography", props: { h1: true }, children: "Heading" },

  // ---- molecules ----
  { name: "Accordion", dir: "molecules/accordion", file: "accordion", props: { items: [{ key: "a", title: "Section A", content: "Body A" }] } },
  { name: "ActionPanel", dir: "molecules/action-panels", file: "action-panels", props: { title: "Delete project", description: "This cannot be undone.", actionLabel: "Delete", destructive: true } },
  { name: "AlertDialog", dir: "molecules/alert-dialog", file: "alert-dialog", props: { open: true, title: "Are you sure?", description: "This deletes the record.", confirmLabel: "Delete", cancelLabel: "Cancel" } },
  { name: "Alert", dir: "molecules/alert", file: "alert", props: { title: "Heads up", description: "Your trial ends soon.", info: true } },
  { name: "Card", dir: "molecules/card", file: "card", props: { title: "Card", description: "Subtitle", body: "Body copy", footer: "Footer" } },
  { name: "CodeBlock", dir: "molecules/code-block", file: "code-block", props: { code: "const x = 1;\nconsole.log(x);", language: "ts" } },
  { name: "Collapsible", dir: "molecules/collapsible", file: "collapsible", props: { title: "More", defaultOpen: true }, children: "Panel body" },
  { name: "DescriptionList", dir: "molecules/description-lists", file: "description-lists", props: { items: [{ term: "Name", value: "Ada" }, { term: "Role", value: "Engineer" }] } },
  { name: "EmptyState", dir: "molecules/empty-state", file: "empty-state", props: { icon: "∅", title: "No results", description: "Try a different search.", actionLabel: "Reset" } },
  { name: "Feed", dir: "molecules/feeds", file: "feeds", props: { items: [{ actor: "Rachel Chen", action: "approved the request", time: "2 hours ago" }] } },
  { name: "Field", dir: "molecules/field", file: "field", props: { label: "Email", placeholder: "you@acme.dev", helper: "We never share it." } },
  { name: "Fieldset", dir: "molecules/fieldset", file: "fieldset", props: { legend: "Address", items: [{ label: "Street", placeholder: "123 Market St" }] } },
  { name: "Form", dir: "molecules/form", file: "form", props: { stacked: true, fields: [{ label: "Full name", placeholder: "Ada" }, { label: "Email", placeholder: "ada@acme.dev" }] } },
  { name: "GridList", dir: "molecules/grid-lists", file: "grid-lists", props: { items: [{ title: "Design", subtitle: "12 files" }, { title: "Research", subtitle: "3 files" }] } },
  { name: "MediaObject", dir: "molecules/media-objects", file: "media-objects", props: { title: "Rachel Chen", description: "Product designer", avatar: "RC" } },
  { name: "StackedList", dir: "molecules/stacked-lists", file: "stacked-lists", props: { items: [{ name: "Ada Lovelace", detail: "ada@acme.dev" }, { name: "Alan Turing", detail: "alan@acme.dev" }] } },
  { name: "Stats", dir: "molecules/stats", file: "stats", props: { items: [{ label: "Total users", value: "12,847", delta: "+12.5%" }, { label: "Revenue", value: "$48.2k" }] } },

  // ---- organisms ----
  { name: "ActionSheet", dir: "organisms/action-sheet", file: "action-sheet", props: { open: true, onOpenChange: noop, title: "Options", actions: [{ label: "Delete", destructive: true, onPress: noop }, { label: "Share", onPress: noop }] } },
  { name: "Calendar", dir: "organisms/calendar", file: "calendar", props: { month: "June 2026", selected: 10, today: 12, daysInMonth: 30, startWeekday: 1 } },
  { name: "Carousel", dir: "organisms/carousel", file: "carousel", props: { index: 0, onIndexChange: noop, items: [{ key: "a", content: "A" }, { key: "b", content: "B" }, { key: "c", content: "C" }] } },
  { name: "Chart", dir: "organisms/charts", file: "charts", props: { title: "Signups", data: [{ label: "Mon", value: 3 }, { label: "Tue", value: 5 }, { label: "Wed", value: 2 }] } },
  { name: "StackedBar", dir: "organisms/charts", file: "charts", props: { label: "Traffic sources", segments: [{ label: "Direct", value: 60 }, { label: "Search", value: 40 }] } },
  { name: "Gauge", dir: "organisms/charts", file: "charts", props: { value: 72, label: "Uptime" } },
  { name: "Heatmap", dir: "organisms/charts", file: "charts", props: { label: "Activity", values: [0.1, 0.4, 0.8, 0.2, 0.9, 0.5] } },
  { name: "LineChart", dir: "organisms/charts", file: "charts", props: { title: "Signups", labels: ["Jan", "Feb", "Mar"], series: [{ label: "Web", values: [1, 3, 2] }, { label: "Mobile", values: [2, 1, 4] }] } },
  { name: "PieChart", dir: "organisms/charts", file: "charts", props: { label: "Traffic", donut: true, slices: [{ label: "Direct", value: 60 }, { label: "Search", value: 40 }] } },
  { name: "ScatterPlot", dir: "organisms/charts", file: "charts", props: { title: "Load vs latency", series: [{ label: "A", points: [{ x: 1, y: 2 }, { x: 3, y: 4 }] }] } },
  { name: "CandlestickChart", dir: "organisms/charts", file: "charts", props: { title: "Daily", labels: ["Mon", "Tue"], candles: [{ open: 1, high: 3, low: 0.5, close: 2 }, { open: 2, high: 4, low: 1.5, close: 1.8 }], volume: [10, 12] } },
  { name: "AreaChart", dir: "organisms/charts", file: "charts", props: { title: "Traffic", labels: ["Jan", "Feb", "Mar"], series: [{ label: "Direct", values: [1, 3, 2] }, { label: "Search", values: [2, 1, 4] }], stacked: true } },
  { name: "Command", dir: "organisms/command", file: "command", props: { open: true, placeholder: "Search…", active: 0, groups: [{ heading: "Actions", items: [{ label: "New file" }, { label: "Open" }] }] } },
  { name: "DataTable", dir: "organisms/data-table", file: "data-table", props: { columns: ["Name", "Role"], rows: [["Ada", "Eng"], ["Bob", "PM"]] } },
  { name: "Dialog", dir: "organisms/dialog", file: "dialog", props: { open: true, onOpenChange: noop, title: "Edit profile", description: "Update your details.", confirmLabel: "Save", cancelLabel: "Cancel" } },
  { name: "Drawer", dir: "organisms/drawer", file: "drawer", props: { open: true, onOpenChange: noop, left: true }, children: txt("Drawer panel content") },
  { name: "FilterPanel", dir: "organisms/filter-panel", file: "filter-panel", props: { groups: [{ title: "Status", options: [{ label: "Active", checked: true }, { label: "Archived" }] }] } },
  { name: "Navbar", dir: "organisms/navbars", file: "navbars", props: { brand: "Acme", links: ["Home", "Docs", "Pricing"], active: 0, actionLabel: "Sign in" } },
  { name: "Overlay", dir: "organisms/overlays", file: "overlays", props: { open: true, onOpenChange: noop, title: "Details", description: "More info here.", drawer: true } },
  { name: "RowMenu", dir: "organisms/row-menu", file: "row-menu", props: { open: true, items: [{ label: "Edit" }, { label: "Delete", destructive: true }] } },
  { name: "Sidebar", dir: "organisms/sidebar", file: "sidebar", props: { items: [{ label: "Dashboard", icon: "■" }, { label: "Settings", badge: "3" }], active: 0 } },
  { name: "Stepper", dir: "organisms/stepper", file: "stepper", props: { current: 1, steps: [{ label: "Cart" }, { label: "Shipping" }, { label: "Payment" }] } },
  { name: "TabBar", dir: "organisms/tab-bar", file: "tab-bar", props: { active: "a", onSelect: noop, items: [{ key: "a", label: "Home", icon: () => txt("H") }, { key: "b", label: "Search", icon: () => txt("S") }] } },
  { name: "Tabs", dir: "organisms/tabs", file: "tabs", props: { tabs: ["One", "Two", "Three"], active: 0 } },
  { name: "Toast", dir: "organisms/toast", file: "toast", props: { message: "Saved", success: true } },
  { name: "ToastProvider", dir: "organisms/toast", file: "toast", children: txt("App content") },
];

const PLATFORMS = ["ios", "android"] as const;

for (const platform of PLATFORMS) {
  describe(`${platform} skins mount inside ThemeProvider`, () => {
    for (const c of CASES) {
      it(`${c.name}`, async () => {
        const mod = (await import(`../src/${c.dir}/${c.file}.${platform}.tsx`)) as Record<string, unknown>;
        const Comp = mod[c.name];
        // A renamed/dropped export in a skin file is itself a defect this catches.
        expect(Comp, `${c.name} not exported from ${c.dir}/${c.file}.${platform}.tsx`).toBeDefined();
        const kids = typeof c.children === "function" ? (c.children as (m: Record<string, unknown>) => ReactNode)(mod) : c.children;
        // The core assertion: the skin renders on this platform without throwing
        // (a missing token, bad StyleSheet, or runtime error surfaces here).
        expect(() => {
          render(createElement(ThemeProvider, null, createElement(Comp as never, c.props ?? null, kids)));
        }).not.toThrow();
      });
    }
  });
}
