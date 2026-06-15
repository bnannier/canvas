import type { ComponentDoc } from "./types";

export const COMPONENTS: ComponentDoc[] = [
  // Primitives: the raw React Native building blocks Canvas re-exports
  // (@olympusoss/canvas). Styled with plain RN style objects, identical on every
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
    description: "The touchable primitive: wraps content, fires onPress, and exposes the press state to its style for feedback.",
    category: "Atoms",
  },
  {
    slug: "image",
    name: "Image",
    description: "Displays a local or remote image with a source and resizeMode (cover, contain, stretch, center).",
    category: "Atoms",
  },
  {
    slug: "text-input",
    name: "Text Input",
    description: "Single-line or multiline text entry, controlled with value and onChangeText.",
    category: "Atoms",
  },
  {
    slug: "scroll-view",
    name: "Scroll View",
    description: "A scrollable container for content larger than its bounds; vertical by default, horizontal optional.",
    category: "Atoms",
  },

  {
    slug: "avatar",
    name: "Avatars",
    description: "A photo when the account has one, falling back to two initials on a brand gradient (seeded admin accounts). Sizes scale font proportionally (40% of diameter).",
    category: "Atoms",
  },

  {
    slug: "badge",
    name: "Badges",
    description: "Two families on one Badge component, picked by boolean props. The metadata badge is a rectangular pill for labels like schema, role, or tag (tones: default, secondary, outline, destructive; add <code>mono</code> for token names). The status badge (<code>status</code>) is a rounded pill with a leading dot for live state like active, pending, or failed (tones: success, warning, error, info, neutral).",
    category: "Atoms",
  },

  {
    slug: "breadcrumb",
    name: "Breadcrumbs",
    description: "Hierarchical navigation showing where you are.",
    category: "Atoms",
  },

  {
    slug: "button-group",
    name: "Button Groups",
    description: "Segmented controls, split buttons, attached groups.",
    category: "Atoms",
  },

  {
  slug: "button",
  name: "Buttons",
  description: "Six variants × four sizes × disabled / focus / hover states. Always semantic: variant communicates intent (default = primary action, destructive = irreversible, ghost = chrome).",
  category: "Atoms",
},

  {
    slug: "checkbox",
    name: "Checkboxes",
    description: "Multi-select option, single yes/no, grouped lists.",
    category: "Atoms",
  },

  {
    slug: "combobox",
    name: "Comboboxes",
    description: "Text input + dropdown: searchable single-select.",
    category: "Atoms",
  },

  {
    slug: "divider",
    name: "Dividers",
    description: "Horizontal, vertical, with label, with action.",
    category: "Atoms",
  },

  {
    slug: "dropdown",
    name: "Dropdowns",
    description: "Floating menus triggered by a button: actions, options, navigation.",
    category: "Atoms",
  },

  {
    slug: "icon",
    name: "Icons",
    description: "Lucide-style outline. 1.75 stroke width, rounded caps. Inherits currentColor, so the same icon adapts to any context: set the color on the parent.",
    category: "Atoms",
  },

  {
    slug: "input",
    name: "Inputs & Forms",
    description: "The Input component is a React Native text field with semantic boolean props (<code>error</code>, <code>small</code>, <code>large</code>, <code>block</code>, <code>disabled</code>), plus prefix/suffix addons and overlaid icons; <code>multiline</code> turns it into a textarea. Select and the search field share its look, and Field and Form compose a label, the control, and helper text.",
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
    name: "Radios",
    description: "Single-pick selection: stacked, inline, card-style.",
    category: "Atoms",
  },

  {
    slug: "select",
    name: "Selects",
    description: "Native select restyled to match Canvas inputs.",
    category: "Atoms",
  },

  {
    slug: "skeleton",
    name: "Skeletons",
    description: "Placeholders for loading content.",
    category: "Atoms",
  },

  {
    slug: "textarea",
    name: "Textareas",
    description: "Multi-line input, with character count, with toolbar.",
    category: "Atoms",
  },

  {
    slug: "switch",
    name: "Toggles",
    description: "On / off switch, isolated or grouped in a settings list.",
    category: "Atoms",
  },

  {
    slug: "tooltip",
    name: "Tooltips",
    description: "Small floating helper text on hover or focus.",
    category: "Atoms",
  },

  {
    slug: "alert",
    name: "Alerts",
    description: "Inline notification banners: info, success, warning, and error, plus a full-width announcement bar. For a blocking confirmation prompt, see Alert Dialog.",
    category: "Molecules",
  },

  {
    slug: "alert-dialog",
    name: "Alert Dialog",
    description: "Catalyst-style confirmation dialog: a centered panel over a dimmed, blurred backdrop, with a title, description, optional body, and action buttons. Reserve it for decisions that must block the rest of the app.",
    category: "Molecules",
  },

  {
    slug: "fieldset",
    name: "Fieldsets",
    description: "Group related form controls under a legend. Each field pairs a label, control, optional help text, and an inline error, so a set of inputs reads as one labeled unit.",
    category: "Molecules",
  },

  {
    slug: "listbox",
    name: "Listboxes",
    description: "A custom (non-native) select: single or multi-select, optional avatars or icons per option, and a checkmark on the chosen items. Reach for it when a native select can't show rich options; prefer a native select for simple short lists.",
    category: "Atoms",
  },

  {
    slug: "card",
    name: "Cards",
    description: "Three families. <code>StatCard</code> = a single metric, big number + delta. <code>SectionCard</code> = a labeled content surface with optional header and divider. Generic <code>card</code> = bring your own structure. Density: pass <code>compact</code> or <code>comfortable</code> to tighten or relax the card's own padding and the gap between flat children (<code>compact</code> takes precedence, and a density prop pads the surface on its own).",
    category: "Molecules",
  },

  {
    slug: "code-block",
    name: "Code Block",
    description: "Preformatted code block with monospace font and padding.",
    category: "Molecules",
  },

  {
    slug: "empty-state",
    name: "Empty States",
    description: "Centered, calm, never blame the user. Always tell them what could be here, and ideally how to get there.",
    category: "Molecules",
  },

  {
    slug: "field",
    name: "Field Display",
    description: "Read-only key/value pairs. Used in detail views, modal previews, and audit screens. Optional mono mode for IDs, tokens, dates.",
    category: "Molecules",
  },

  {
    slug: "form",
    name: "Form Layouts",
    description: "Stacked, two-column, with sidebar description.",
    category: "Molecules",
  },

  {
    slug: "filter-panel",
    name: "Filter Panels",
    description: "Sidebar filter rail with chip pills for active filters.",
    category: "Organisms",
  },

  {
    slug: "calendar",
    name: "Calendars",
    description: "Date picker, event list. Production: wrap react-day-picker.",
    category: "Organisms",
  },

  {
    slug: "command",
    name: "Command Palette",
    description: "Cmd+K search: navigation, actions, recent items.",
    category: "Organisms",
  },

  {
    slug: "data-table",
    name: "Data Tables",
    description: "Every table is the same composition: bordered wrap &rarr; toolbar &rarr; scrollable table &rarr; footer. Density tweaks affect padding live.",
    category: "Organisms",
  },

  {
    slug: "dialog",
    name: "Dialog",
    description: "A modal dialog: a centered panel over a dimmed, blurred backdrop, with a title, an optional description, a body for real content like a form, and right-aligned actions. Use it for a focused task that warrants interrupting the page; reach for the Alert Dialog for a terse yes/no confirmation.",
    category: "Organisms",
  },

  {
    slug: "overlays",
    name: "Overlays",
    description: "Floating surfaces: drawers, modals, popovers, toasts.",
    category: "Organisms",
},

  {
    slug: "sidebar",
    name: "Navigation",
    description: "Sidebar + Topbar + breadcrumbs + page header. The sidebar you see on the left of this very page is the production sidebar: same component, same width, same drawer behavior.",
    category: "Organisms",
  },

  {
    slug: "stepper",
    name: "Steppers",
    description: "Multi-step progress indicators: horizontal, vertical, with progress.",
    category: "Organisms",
  },

  {
    slug: "tabs",
    name: "Tabs",
    description: "Underline, pill, vertical, with badges.",
    category: "Organisms",
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
    slug: "popover",
    name: "Popover",
    description: "Floating panel for rich content triggered by a click.",
    category: "Atoms",
  },

  {
    slug: "row-menu",
    name: "Row Menu",
    description: "Vertical action menu items and navigation links.",
    category: "Organisms",
  },

  {
    slug: "action-panels",
    name: "Action Panels",
    description: "Section card with headline, body text, and a primary action. Used to surface a single decision or call-to-action.",
    category: "Molecules",
  },

  {
    slug: "description-lists",
    name: "Description Lists",
    description: "Key-value pairs in stacked, two-column, or inline-edit layouts. Used for detail panels, settings, and profile views.",
    category: "Molecules",
  },

  {
    slug: "feeds",
    name: "Feeds",
    description: "Vertical activity streams with icons and timestamps. Used for audit logs, change history, and notification lists.",
    category: "Molecules",
  },

  {
    slug: "grid-lists",
    name: "Grid Lists",
    description: "Tiled card grids for people directories, item collections, and image galleries.",
    category: "Molecules",
  },

  {
    slug: "media-objects",
    name: "Media Objects",
    description: "Image or icon paired with text content. The fundamental building block for list items, notifications, and comment layouts.",
    category: "Molecules",
  },

  {
    slug: "stacked-lists",
    name: "Stacked Lists",
    description: "Vertical lists with avatar, two-line items, and trailing metadata. Used for contacts, activity feeds, and data previews.",
    category: "Molecules",
  },

  {
    slug: "stats",
    name: "Stats",
    description: "Single value, grouped row, with sparkline, with comparison. Used for dashboards and overview pages.",
    category: "Molecules",
  },

  {
    slug: "charts",
    name: "Charts",
    description: "Sparklines, bars, gauges, heatmaps. All SVG, all token-themed. No charting library required.",
    category: "Organisms",
  },

  {
    slug: "navbars",
    name: "Navbars",
    description: "Topbars with navigation links, search, and action buttons. Used as the primary app-level navigation.",
    category: "Organisms",
  },
];

export function getComponent(slug: string): ComponentDoc | undefined {
  return COMPONENTS.find((c) => c.slug === slug);
}

export function getComponentsByCategory(category: string): ComponentDoc[] {
  return COMPONENTS.filter((c) => c.category === category);
}
