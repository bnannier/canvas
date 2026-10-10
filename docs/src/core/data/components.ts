import type { ComponentDoc } from "./types";

// Every documented component. A component's description is not written here: it is the
// first paragraph of its page's intro (src/<category>/<dir>/<dir>.md), generated into
// docs/src/core/descriptions.ts, which the page's lead and the search index read.
export const COMPONENTS: ComponentDoc[] = [
  // Primitives: the raw React Native building blocks Canvas re-exports
  // (@nannier/canvas). Styled with plain RN style objects, identical on every
  // platform. The foundation every higher-level component is built from.
  {
    slug: "view",
    name: "View",
    category: "Atoms",
  },
  {
    slug: "text",
    name: "Text",
    category: "Atoms",
  },
  {
    slug: "pressable",
    name: "Pressable",
    category: "Atoms",
  },
  {
    slug: "image",
    name: "Image",
    category: "Atoms",
  },
  {
    slug: "text-input",
    name: "TextInput",
    category: "Atoms",
  },
  {
    slug: "scroll-view",
    name: "ScrollView",
    category: "Atoms",
    // A ScrollView fills its parent by default, so its preview fills the stage width
    // and aligns left. This also gives the width:"100%" examples a definite full-stage
    // width to resolve against (center mode shrink-wraps and would collapse them to 0).
    stageAlign: "start",
  },

  {
    slug: "row-column",
    dir: "layout",
    name: "Row & Column",
    category: "Atoms",
    // A Row or Column is a layout container, so its examples show how children share
    // a width. The stretched stage IS that width: in center mode a bare Row shrink-wraps
    // its children and center / between / wrap / span have nothing to distribute over.
    stageAlign: "start",
  },

  {
    slug: "container",
    name: "Container",
    category: "Atoms",
    // Container caps and centers itself inside its parent, so its examples need the
    // stage's full width as that parent: in center mode a Column of Containers
    // shrink-wraps and every step collapses to its own content.
    stageAlign: "start",
  },

  {
    slug: "grid",
    name: "Grid",
    category: "Atoms",
  },

  {
    slug: "chip",
    name: "Chip",
    category: "Atoms",
  },

  {
    slug: "emblem",
    name: "Emblem",
    category: "Atoms",
  },

  {
    slug: "sparkline",
    name: "Sparkline",
    category: "Charts",
  },

  {
    slug: "autocomplete",
    name: "Autocomplete",
    category: "Atoms",
    // A field fills its parent either way; the stretched stage makes the parent the
    // stage itself, so the "Measure" Column of stepped fields and Container steps
    // has a definite width to hand down (in center mode it shrink-wraps and every
    // step collapses to the field's own content).
    stageAlign: "start",
  },

  {
    slug: "avatar",
    name: "Avatar",
    category: "Atoms",
  },

  {
    slug: "badge",
    name: "Badge",
    category: "Atoms",
  },

  {
    slug: "breadcrumb",
    name: "Breadcrumb",
    category: "Atoms",
    // A breadcrumb is a full-width nav trail read from the leading edge, so its
    // preview fills the row and aligns left rather than floating in the center.
    stageAlign: "start",
  },

  {
    slug: "button-group",
    name: "ButtonGroup",
    category: "Atoms",
  },

  {
    slug: "button",
    name: "Button",
    category: "Atoms",
  },

  {
    slug: "checkbox",
    name: "Checkbox",
    category: "Atoms",
  },

  {
    slug: "divider",
    name: "Divider",
    category: "Atoms",
    stageAlign: "start",
  },

  {
    slug: "dropdown",
    name: "Dropdown",
    category: "Atoms",
  },

  {
    slug: "icon",
    name: "Icon",
    category: "Atoms",
  },

  {
    slug: "input",
    name: "Input",
    category: "Atoms",
    // A field fills its parent either way; the stretched stage makes the parent the
    // stage itself, so the "Measure" Column of stepped fields and Container steps
    // has a definite width to hand down (in center mode it shrink-wraps and every
    // step collapses to the field's own content).
    stageAlign: "start",
  },

  {
    slug: "pagination",
    name: "Pagination",
    category: "Atoms",
  },

  {
    slug: "radio",
    name: "Radio",
    category: "Atoms",
  },

  {
    slug: "reveal",
    name: "Reveal",
    category: "Atoms",
  },

  {
    slug: "select",
    name: "Select",
    category: "Atoms",
    // A field fills its parent either way; the stretched stage makes the parent the
    // stage itself, so the "Measure" Column of stepped fields and Container steps
    // has a definite width to hand down (in center mode it shrink-wraps and every
    // step collapses to the field's own content).
    stageAlign: "start",
  },

  {
    slug: "skeleton",
    name: "Skeleton",
    category: "Atoms",
    // Placeholders stand in for real content, which fills its container and reads
    // from the leading edge, so the stage fills its width and pins the example left
    // rather than floating it centered: the card scaffold spans the full width, and
    // the composite list/table shapes expand to their own caps instead of collapsing.
    stageAlign: "start",
  },

  {
    slug: "textarea",
    name: "Textarea",
    category: "Atoms",
    // A field fills its parent either way; the stretched stage makes the parent the
    // stage itself, so the "Measure" Column of stepped fields and Container steps
    // has a definite width to hand down (in center mode it shrink-wraps and every
    // step collapses to the field's own content).
    stageAlign: "start",
  },

  {
    slug: "swatch",
    name: "Swatch",
    category: "Atoms",
    // A color sheet reads from the leading edge, and the `block` variant is a
    // full-width ramp bar, so the stage fills its width and pins the example left
    // instead of shrink-wrapping it centered (which would collapse `block` to the
    // width of its own label).
    stageAlign: "start",
  },

  {
    slug: "switch",
    name: "Switch",
    category: "Atoms",
  },

  {
    slug: "tooltip",
    name: "Tooltip",
    category: "Atoms",
  },

  {
    slug: "alert",
    name: "Alert",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "alert-dialog",
    name: "AlertDialog",
    category: "Molecules",
  },

  {
    slug: "listbox",
    name: "Listbox",
    category: "Atoms",
    stageAlign: "start",
  },

  {
    slug: "card",
    name: "Card",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "code-block",
    name: "CodeBlock",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "field",
    name: "Field",
    category: "Molecules",
    stageAlign: "start",
  },
  {
    slug: "empty-state",
    name: "EmptyState",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "form",
    name: "Form",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "filter-panel",
    name: "FilterPanel",
    category: "Organisms",
    stageAlign: "start",
  },

  {
    slug: "board",
    name: "Board",
    category: "Organisms",
    stageAlign: "start",
  },

  {
    slug: "calendar",
    name: "Calendar",
    category: "Organisms",
    stageAlign: "start",
  },

  {
    slug: "command",
    name: "Command",
    category: "Organisms",
    stageAlign: "start",
  },

  {
    slug: "dashboard-grid",
    name: "DashboardGrid",
    category: "Organisms",
    stageAlign: "start",
  },

  {
    slug: "data-table",
    name: "DataTable",
    category: "Organisms",
    stageAlign: "start",
  },

  {
    slug: "dialog",
    name: "Dialog",
    category: "Organisms",
  },
  {
    slug: "drag-drop",
    name: "Drag & drop",
    category: "Organisms",
    // A drop zone is a layout container that fills its parent; the stretched stage
    // is that parent, so the zones and their cards span the stage instead of
    // hugging a card's label in center mode.
    stageAlign: "start",
  },
  {
    slug: "drawer",
    name: "Drawer",
    category: "Organisms",
  },

  {
    slug: "sidebar",
    name: "Sidebar",
    category: "Organisms",
    stageAlign: "start",
    singlePreview: true,
  },

  {
    slug: "steps",
    name: "Steps",
    category: "Organisms",
    stageAlign: "start",
  },

  {
    slug: "tab-bar",
    name: "TabBar",
    category: "Organisms",
    stageAlign: "start",
  },

  {
    slug: "tabs",
    name: "Tabs",
    category: "Organisms",
    stageAlign: "start",
  },

  {
    slug: "kbd",
    name: "Kbd",
    category: "Atoms",
  },

  {
    slug: "typography",
    name: "Typography",
    category: "Atoms",
  },
  {
    slug: "video",
    name: "Video",
    category: "Atoms",
  },

  {
    slug: "spinner",
    name: "Spinner",
    category: "Atoms",
  },

  {
    slug: "progress",
    name: "Progress",
    category: "Atoms",
    stageAlign: "start",
  },

  {
    slug: "slider",
    name: "Slider",
    category: "Atoms",
    stageAlign: "start",
  },

  {
    slug: "accordion",
    name: "Accordion",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "action-sheet",
    name: "ActionSheet",
    category: "Organisms",
  },

  {
    slug: "stepper",
    name: "Stepper",
    category: "Atoms",
  },

  {
    slug: "input-otp",
    name: "InputOTP",
    category: "Atoms",
  },

  {
    slug: "collapsible",
    name: "Collapsible",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "carousel",
    name: "Carousel",
    category: "Organisms",
    stageAlign: "start",
  },

  {
    slug: "toast",
    name: "Toast",
    category: "Organisms",
  },

  {
    slug: "popover",
    name: "Popover",
    category: "Atoms",
  },
  {
    slug: "qrcode",
    name: "QRCode",
    category: "Atoms",
  },

  {
    slug: "row-menu",
    name: "RowMenu",
    category: "Organisms",
  },

  {
    slug: "action-panels",
    name: "ActionPanel",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "description-lists",
    name: "DescriptionList",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "feeds",
    name: "Feed",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "grid-lists",
    name: "GridList",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "media-objects",
    name: "MediaObject",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "phone-input",
    name: "PhoneInput",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "stacked-lists",
    name: "StackedList",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "stats",
    name: "Stats",
    category: "Molecules",
    stageAlign: "start",
  },

  // Charts: the data-viz tier. One component per chart type, all sharing the
  // token-themed frame, the colorblind-validated chart-1..8 series palette,
  // and scrub-to-inspect. No charting library required.
  {
    slug: "chart",
    name: "Chart",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "line-chart",
    name: "LineChart",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "area-chart",
    name: "AreaChart",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "pie-chart",
    name: "PieChart",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "scatter-plot",
    name: "ScatterPlot",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "candlestick-chart",
    name: "CandlestickChart",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "depth-chart",
    name: "DepthChart",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "stacked-bar",
    name: "StackedBar",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "gauge",
    name: "Gauge",
    category: "Charts",
  },
  {
    slug: "heatmap",
    name: "Heatmap",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "bar-list",
    name: "BarList",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "metric-breakdown",
    name: "MetricBreakdown",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "uptime-bar",
    name: "UptimeBar",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "service-health-list",
    name: "ServiceHealthList",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "bullet-chart",
    name: "BulletChart",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "progress-ring",
    name: "ProgressRing",
    category: "Charts",
  },
  {
    slug: "composed-chart",
    name: "ComposedChart",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "range-area-chart",
    name: "RangeAreaChart",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "histogram",
    name: "Histogram",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "box-plot",
    name: "BoxPlot",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "waterfall-chart",
    name: "WaterfallChart",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "radial-bar-chart",
    name: "RadialBarChart",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "funnel-chart",
    name: "FunnelChart",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "radar-chart",
    name: "RadarChart",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "treemap",
    name: "Treemap",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "geo-map",
    name: "GeoMap",
    category: "Charts",
    stageAlign: "start",
  },

  {
    slug: "navbars",
    name: "Navbar",
    category: "Organisms",
    stageAlign: "start",
  },
];

export function getComponent(slug: string): ComponentDoc | undefined {
  return COMPONENTS.find((c) => c.slug === slug);
}

export function getComponentsByCategory(category: string): ComponentDoc[] {
  return COMPONENTS.filter((c) => c.category === category);
}
