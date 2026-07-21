import type { ComponentDoc } from "./types";

export const COMPONENTS: ComponentDoc[] = [
  // Primitives: the raw React Native building blocks Canvas re-exports
  // (@nannier/canvas). Styled with plain RN style objects, identical on every
  // platform. The foundation every higher-level component is built from.
  {
    slug: "view",
    name: "View",
    description: "The layout primitive: a flex container that runs identically on iOS, Android, and the web. Set layout with a React Native style object (flexDirection, gap, alignItems, padding).",
    category: "Atoms",
  },
  {
    slug: "text",
    name: "Text",
    description: "Renders text. In React Native every string must live inside a Text element; style it with fontSize, fontWeight, and color, and truncate with numberOfLines.",
    category: "Atoms",
  },
  {
    slug: "pressable",
    name: "Pressable",
    description: "The touchable primitive: wraps content, fires onPress, and exposes the press state to its style for feedback. The kit's interactive components (Button, plus the tappable Card, Stats, GridList, MediaObject, and StackedList rows) cover the common cases and keep branding consistent, so prefer them. Pressable stays here for full flexibility when you need a custom interaction the kit doesn't provide; style it with tokens to stay on-brand.",
    category: "Atoms",
  },
  {
    slug: "image",
    name: "Image",
    description: "Displays a local or remote image with a source and a boolean fit prop (cover, contain, stretch, center, repeat, none).",
    category: "Atoms",
  },
  {
    slug: "text-input",
    name: "TextInput",
    description: "Single-line or multiline text entry, controlled with value and onChangeText.",
    category: "Atoms",
  },
  {
    slug: "scroll-view",
    name: "ScrollView",
    description: "A scrollable container for content larger than its bounds; vertical by default, horizontal optional.",
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
    description: "The layout primitives. Row lays children out horizontally, Column vertically, with a semantic gap scale (flush / tight / snug / cozy / relaxed / loose), main-axis distribution (center, between), cross-axis alignment (alignCenter, baseline), and wrap / fill / grow, so a call site never hand-rolls flexDirection, gap, or alignItems.",
    category: "Atoms",
  },

  {
    slug: "chip",
    name: "Chip",
    description: "An interactive pill: filter chips, tags, and selectable tokens. A low-emphasis soft-tinted tag (never a saturated button fill), with an optional leading icon and label, tappable with onPress, and a trailing × remove button with onRemove. Color is a boolean axis: semantic status (success / warning / error / info / neutral) or a free-form palette hue (red … rose, gray); outline and primary set the emphasis.",
    category: "Atoms",
  },

  {
    slug: "emblem",
    name: "Emblem",
    description: "A tinted rounded square (or circle) that holds a single Icon or a short monogram, the recurring icon-on-a-soft-background used in cards, media objects, empty states, and feeds. A tone tints the square and paints the glyph to match, so no call site hand-composes the icon background.",
    category: "Atoms",
  },

  {
    slug: "sparkline",
    name: "Sparkline",
    description: "A compact trend strip: a row of thin bars whose heights track a series of values, with the series in a soft wash of the tone and the latest bar in the full accent. Pass values and it sizes each bar against the series max and paints the tone, so no call site hand-composes a row of flexGrow + height Views to draw an inline trend on a stat card or dashboard.",
    category: "Atoms",
  },

  {
    slug: "autocomplete",
    name: "Autocomplete",
    description: "Text input + dropdown: searchable single-select.",
    category: "Atoms",
  },

  {
    slug: "avatar",
    name: "Avatar",
    description: "A photo when the account has one, falling back to one or two initials in white on a colour picked deterministically from the name, so each person stays visually distinct in a stack or list. A pressable avatar (onPress) keeps interactive Liquid Glass on iOS 26+ under glass surface mode. Sizes scale font proportionally (40% of diameter).",
    category: "Atoms",
  },

  {
    slug: "badge",
    name: "Badge",
    description: "Two families on one Badge component, picked by boolean props. The metadata badge is a rectangular pill for labels like schema, role, or tag (tones: default, secondary, outline, destructive; add <code>mono</code> for token names). The status badge (<code>status</code>) is a rounded pill with a leading dot for live state like active, pending, or failed (tones: success, warning, error, info, neutral).",
    category: "Atoms",
  },

  {
    slug: "breadcrumb",
    name: "Breadcrumb",
    description: "Hierarchical navigation showing where you are.",
    category: "Atoms",
    // A breadcrumb is a full-width nav trail read from the leading edge, so its
    // preview fills the row and aligns left rather than floating in the center.
    stageAlign: "start",
  },

  {
    slug: "button-group",
    name: "ButtonGroup",
    description: "Segmented controls, split buttons, attached groups.",
    category: "Atoms",
  },

  {
  slug: "button",
  name: "Button",
  description: "Six variants × four sizes × disabled / focus / hover states. Always semantic: variant communicates intent (default = primary action, destructive = irreversible, ghost = chrome).",
  category: "Atoms",
},

  {
    slug: "checkbox",
    name: "Checkbox",
    description: "Multi-select option, single yes/no, grouped lists.",
    category: "Atoms",
  },

  {
    slug: "divider",
    name: "Divider",
    description: "Horizontal, vertical, with label, with action.",
    category: "Atoms",
    stageAlign: "start",
  },

  {
    slug: "dropdown",
    name: "Dropdown",
    description: "Floating menus triggered by a button: actions, options, navigation.",
    category: "Atoms",
  },

  {
    slug: "icon",
    name: "Icon",
    description: "Lucide-style outline. 1.75 stroke width, rounded caps. Inherits currentColor, so the same icon adapts to any context: set the color on the parent.",
    category: "Atoms",
  },

  {
    slug: "input",
    name: "Input",
    description: "The Input component is a React Native text field with semantic boolean props (<code>error</code>, <code>small</code>, <code>large</code>, <code>disabled</code>), plus prefix/suffix addons and overlaid icons. Input is single-line; for multi-line entry use the dedicated Textarea. Every field renders at the standard width by default (<code>narrow</code> and <code>wide</code> pick the other modes, <code>block</code> fills the container). Select and the search field share its look, and Form stitches labeled inputs into a full form.",
    category: "Atoms",
  },

  {
    slug: "pagination",
    name: "Pagination",
    description: "Page-of-N navigation for tables and lists.",
    category: "Atoms",
  },

  {
    slug: "radio",
    name: "Radio",
    description: "Single-pick selection: stacked, inline, card-style.",
    category: "Atoms",
  },

  {
    slug: "select",
    name: "Select",
    description: "Native select restyled to match Canvas inputs.",
    category: "Atoms",
  },

  {
    slug: "skeleton",
    name: "Skeleton",
    description: "Placeholders for loading content.",
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
    description: "Multi-line input, with character count, with toolbar.",
    category: "Atoms",
  },

  {
    slug: "switch",
    name: "Switch",
    description: "On / off switch, isolated or grouped in a settings list.",
    category: "Atoms",
  },

  {
    slug: "tooltip",
    name: "Tooltip",
    description: "Small floating helper text on hover or focus.",
    category: "Atoms",
  },

  {
    slug: "alert",
    name: "Alert",
    description: "Inline notification banners: info, success, warning, and error, plus a full-width announcement bar. For a blocking confirmation prompt, see Alert Dialog.",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "alert-dialog",
    name: "AlertDialog",
    description: "Catalyst-style confirmation dialog: a centered panel over a dimmed, blurred backdrop, with a title, description, optional body, and action buttons. Reserve it for decisions that must block the rest of the app.",
    category: "Molecules",
  },

  {
    slug: "listbox",
    name: "Listbox",
    description: "A custom (non-native) select: single or multi-select, optional avatars or icons per option, and a checkmark on the chosen items. Reach for it when a native select can't show rich options; prefer a native select for simple short lists.",
    category: "Atoms",
    stageAlign: "start",
  },

  {
    slug: "card",
    name: "Card",
    description: "Three families. <code>StatCard</code> = a single metric, big number + delta. <code>SectionCard</code> = a labeled content surface with optional header and divider. Generic <code>card</code> = bring your own structure. Density: pass <code>compact</code> or <code>comfortable</code> to tighten or relax the card's own padding and the gap between flat children (<code>compact</code> takes precedence, and a density prop pads the surface on its own).",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "code-block",
    name: "CodeBlock",
    description:
      "Syntax-highlighted code display with clipboard copy, line emphasis, diffs, collapsible folding, and tabbed alternatives.",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "empty-state",
    name: "EmptyState",
    description: "Centered, calm, never blame the user. Always tell them what could be here, and ideally how to get there.",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "form",
    name: "Form",
    description: "Stitch your own field atoms inside it; Form adds the stacked or two-column rhythm, titled sections, and the submit/cancel actions row.",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "filter-panel",
    name: "FilterPanel",
    description: "Sidebar filter rail: grouped checkbox options with count badges and a Clear header.",
    category: "Organisms",
    stageAlign: "start",
  },

  {
    slug: "calendar",
    name: "Calendar",
    description: "Month grid, week timeline, and day timeline with events: dots mark event days, timed events render as blocks on the hour timelines.",
    category: "Organisms",
    stageAlign: "start",
  },

  {
    slug: "command",
    name: "Command",
    description: "Cmd+K search: navigation, actions, recent items.",
    category: "Organisms",
    stageAlign: "start",
  },

  {
    slug: "data-table",
    name: "DataTable",
    description: "Sortable, selectable, paginated data table with the loading and empty states built in. Columns are labels or descriptors (alignment, fixed widths, sort). Density tweaks affect padding live.",
    category: "Organisms",
    stageAlign: "start",
  },

  {
    slug: "dialog",
    name: "Dialog",
    description: "A modal dialog: a centered panel over a dimmed, blurred backdrop, with a title, an optional description, a body for real content like a form, and right-aligned actions. Use it for a focused task that warrants interrupting the page; reach for the Alert Dialog for a terse yes/no confirmation.",
    category: "Organisms",
  },
  {
    slug: "drag-drop",
    name: "Drag & drop",
    description: "A reusable drag-and-drop context: wrap a surface in a DragDropProvider, mark droppable regions with DropZone, and make items draggable with Draggable plus a DragHandle grip. Cards lift into a floating ghost and reorder within or across zones, position-aware. Built from PanResponder and Animated so it runs on iOS, Android, and the web with no platform forks, and it is fully keyboard- and screen-reader-operable (Space to grab, arrows to move, Space to drop, Escape to cancel).",
    category: "Organisms",
  },
  {
    slug: "drawer",
    name: "Drawer",
    description: "A full-screen panel that slides in from an edge: a navigation drawer, a mobile menu, or a bottom action sheet. Built on React Native's Modal so it floats over the whole app on iOS, Android, and the web. For a small contextual menu, reach for Dropdown or RowMenu instead.",
    category: "Organisms",
  },

  {
    slug: "overlays",
    name: "Overlay",
    description: "Floating surfaces: drawers, modals, popovers, toasts.",
    category: "Organisms",
},

  {
    slug: "sidebar",
    name: "Sidebar",
    description: "Sidebar + Topbar + breadcrumbs + page header. The sidebar on the left of this page is a thin adapter over this very Sidebar component: it feeds the docs' nav tree in and gets the same collapse, accordion, and active-highlight behavior back.",
    category: "Organisms",
    stageAlign: "start",
  },

  {
    slug: "steps",
    name: "Steps",
    description: "Multi-step progress indicators: horizontal, vertical, with progress.",
    category: "Organisms",
    stageAlign: "start",
  },

  {
    slug: "tab-bar",
    name: "TabBar",
    description: "Bottom app navigation: a row of equal-width destinations, each an icon over a short label, with exactly one active. The mobile idiom (iOS HIG tab bar / Material 3 navigation bar), rendered through the glass functional layer.",
    category: "Organisms",
    stageAlign: "start",
  },

  {
    slug: "tabs",
    name: "Tabs",
    description: "Underline, pill, vertical, with badges.",
    category: "Organisms",
    stageAlign: "start",
  },

  {
    slug: "kbd",
    name: "Kbd",
    description: "Keyboard shortcut indicator badge.",
    category: "Atoms",
  },

  {
    slug: "typography",
    name: "Typography",
    description: "Type scale classes for headings, body text, and helper styles.",
    category: "Atoms",
  },

  {
    slug: "spinner",
    name: "Spinner",
    description: "Animated loading spinner in three sizes.",
    category: "Atoms",
  },

  {
    slug: "progress",
    name: "Progress",
    description: "Determinate and indeterminate progress bars.",
    category: "Atoms",
    stageAlign: "start",
  },

  {
    slug: "slider",
    name: "Slider",
    description: "A draggable value/range input with keyboard and screen-reader support.",
    category: "Atoms",
    stageAlign: "start",
  },

  {
    slug: "accordion",
    name: "Accordion",
    description: "A vertically stacked set of collapsible disclosure panels.",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "action-sheet",
    name: "ActionSheet",
    description: "A modal sheet of contextual actions (the iOS action sheet idiom).",
    category: "Organisms",
  },

  {
    slug: "stepper",
    name: "Stepper",
    description: "A ± numeric control: − and + buttons around an editable field, clamped to a range (the iOS UIStepper idiom). For a multi-step progress indicator, see Steps.",
    category: "Atoms",
  },

  {
    slug: "input-otp",
    name: "InputOTP",
    description: "A segmented one-time-code field driven by one input, with SMS autofill and paste.",
    category: "Atoms",
  },

  {
    slug: "collapsible",
    name: "Collapsible",
    description: "A single disclosure: a header that toggles one collapsible content panel.",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "carousel",
    name: "Carousel",
    description: "A horizontally paged slide viewer with snap paging, dot indicators, and optional arrows.",
    category: "Organisms",
    stageAlign: "start",
  },

  {
    slug: "toast",
    name: "Toast",
    description: "A transient notification capsule, rendered directly or driven imperatively via a ToastProvider and the useToast hook.",
    category: "Organisms",
  },

  {
    slug: "popover",
    name: "Popover",
    description: "Floating panel for rich content triggered by a click.",
    category: "Atoms",
  },
  {
    slug: "qrcode",
    name: "QRCode",
    description: "Encodes a string as a scannable QR code. Built on react-native-svg, so it renders the same on iOS, Android, and the web, and stays a fixed dark-on-white card for reliable scanning.",
    category: "Atoms",
  },

  {
    slug: "row-menu",
    name: "RowMenu",
    description: "Vertical action menu items and navigation links.",
    category: "Organisms",
  },

  {
    slug: "action-panels",
    name: "ActionPanel",
    description: "Section card with headline, body text, and a primary action. Used to surface a single decision or call-to-action.",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "description-lists",
    name: "DescriptionList",
    description: "Key-value pairs in stacked, two-column, or inline-edit layouts. Used for detail panels, settings, and profile views. Rows flagged <code>update</code> carry a working in-place editor: Update opens it, Enter or Save commits the new value (firing <code>onUpdate</code>), Escape or Cancel dismisses it.",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "feeds",
    name: "Feed",
    description: "Vertical activity streams with icons and timestamps. Used for audit logs, change history, and notification lists.",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "grid-lists",
    name: "GridList",
    description: "Tiled card grids for people directories, item collections, and image galleries.",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "media-objects",
    name: "MediaObject",
    description: "Image or icon paired with text content. The fundamental building block for list items, notifications, and comment layouts.",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "stacked-lists",
    name: "StackedList",
    description: "Vertical lists with avatar, two-line items, and trailing metadata. Used for contacts, activity feeds, and data previews.",
    category: "Molecules",
    stageAlign: "start",
  },

  {
    slug: "stats",
    name: "Stats",
    description: "Single value, grouped row, with sparkline, with comparison. Used for dashboards and overview pages.",
    category: "Molecules",
    stageAlign: "start",
  },

  // Charts: the data-viz tier. One component per chart type, all sharing the
  // token-themed frame, the colorblind-validated chart-1..8 series palette,
  // and scrub-to-inspect. No charting library required.
  {
    slug: "chart",
    name: "Chart",
    description: "Single- or multi-series bar chart: vertical columns or horizontal rows, grouped clusters via labels + series, press or scrub a category to inspect it.",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "line-chart",
    name: "LineChart",
    description: "Categorical-x series lines with monotone curves, dot markers, and the trading price idiom: a dashed baseline with gain/loss auto-toning and a gradient fade.",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "area-chart",
    name: "AreaChart",
    description: "Series fills: overlapping translucent areas, or running-sum bands with stacked. Shares the line chart's curve, density, and inspect axes.",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "pie-chart",
    name: "PieChart",
    description: "Proportional arc slices with a percent legend; donut centers the total, and pressing a slice dims the rest and swaps the center readout.",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "scatter-plot",
    name: "ScatterPlot",
    description: "Numeric x/y point clouds with nice ticks and gridlines on both axes; pressing near a point rings it and flags its coordinates.",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "candlestick-chart",
    name: "CandlestickChart",
    description: "OHLC candles colored by direction, an optional docked volume pane, and moving-average overlays. Scrub to read Open/High/Low/Close and volume.",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "depth-chart",
    name: "DepthChart",
    description: "The order-book view: cumulative bid and ask step areas mirrored around the spread on a numeric price axis.",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "stacked-bar",
    name: "StackedBar",
    description: "One proportional bar split into colored segments with a legend carrying each share.",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "gauge",
    name: "Gauge",
    description: "A radial dial: muted track, tone-colored fill arc, and the value centered inside.",
    category: "Charts",
    stageAlign: "start",
  },
  {
    slug: "heatmap",
    name: "Heatmap",
    description: "Density cells whose fill encodes each value. A `calendar` layout gives a GitHub-style contribution graph with weekday and month labels and inspect-on-hover.",
    category: "Charts",
    stageAlign: "start",
  },

  {
    slug: "navbars",
    name: "Navbar",
    description: "Topbars with navigation links, search, and action buttons. Used as the primary app-level navigation.",
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
