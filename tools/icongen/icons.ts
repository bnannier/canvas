// Source of truth for the Canvas Icon glyph set. `tools/icongen/generate.ts`
// reads this list plus lucide-static's `icon-nodes.json` and regenerates the
// ICONS map, the NAMES gallery list, and the name-boolean props in
// `src/atoms/icon/icon.shared.tsx` (between the ICONGEN markers). To add glyphs,
// add their Lucide (kebab-case) name to a category in CATEGORIES and run `bun run icons:gen`.
//
// The Canvas prop name is camelCase(source) by default. ALIASES override that for
// icons Lucide renamed in 1.x (so the kit keeps its stable `<Icon alertTriangle/>`
// prop names while sourcing the current Lucide glyph), and for the reserved-word
// guard. Labels in the gallery are kebab(canvasName), i.e. what you type.

/** source (Lucide kebab name) -> Canvas prop name. Preserves existing kit names
 *  across Lucide's 1.x renames, so no existing `<Icon x/>` usage breaks. */
export const ALIASES: Record<string, string> = {
  "triangle-alert": "alertTriangle", // was alert-triangle
  "text-align-start": "alignLeft", // was align-left
  "chart-no-axes-column": "barChart2", // was bar-chart-2
  "square-check": "checkSquare", // was check-square
  funnel: "filter", // was filter
  house: "home", // was home
  "panels-top-left": "layout", // was layout
  ellipsis: "moreHorizontal", // was more-horizontal
};

/** Every glyph name the kit already shipped MUST stay available (existing
 *  `<Icon x/>` call sites depend on it). The generator asserts each of these
 *  camelCase names is produced; if a rename drops one, it fails loudly. */
export const REQUIRED_NAMES = [
  "activity", "alertTriangle", "alignLeft", "appWindow", "archive", "arrowRight",
  "award", "barChart2", "bell", "bookOpen", "box", "calendar", "chartLine", "check",
  "checkSquare", "chevronDown", "chevronLeft", "chevronRight", "chevronsLeft",
  "circleCheck", "circleDot", "circleX", "code", "columns2", "copy", "database",
  "download", "eye", "file", "fileInput", "fileText", "filter", "folder", "footprints",
  "gauge", "gitCompare", "globe", "group", "home", "image", "inbox", "info", "keyRound",
  "keyboard", "layers", "layout", "layoutGrid", "list", "listChecks", "loader", "lock",
  "logOut", "mail", "menu", "messageCircle", "messageSquareWarning", "minus", "moon",
  "moreHorizontal", "mousePointerClick", "moveVertical", "navigation", "palette",
  "panelRight", "pencil", "plug", "plus", "pointer", "rocket", "save", "search",
  "settings", "shield", "smartphone", "square", "star", "sun", "table", "terminal",
  "textCursorInput", "toggleLeft", "trash", "type", "upload", "user", "users", "x", "zap",
];

/** The curated Lucide source names to ship (kebab-case), filed by category. The
 *  categories, in this order, are the kit's `ICON_CATEGORIES`, and each glyph's
 *  category is its `ICON_NAMES` entry's `category`. Add here to enrich the set. */
export const CATEGORIES: readonly { label: string; sources: readonly string[] }[] = [
  {
    label: "Arrows & navigation",
    sources: [
      "arrow-right", "arrow-up", "arrow-down", "arrow-left", "arrow-up-right", "arrow-down-right",
      "arrow-up-left", "arrow-down-left", "chevron-down", "chevron-left", "chevron-right",
      "chevron-up", "chevrons-left", "chevrons-right", "chevrons-up-down", "chevrons-left-right",
      "corner-down-right", "move", "move-horizontal", "move-vertical", "move-3d", "navigation",
      "compass", "locate", "route", "milestone", "map", "map-pin", "flag-triangle-right",
    ],
  },
  {
    label: "Actions",
    sources: [
      "plus", "minus", "x", "search", "pencil", "pen", "eraser", "scissors", "copy", "save",
      "trash", "trash-2", "download", "upload", "cloud-download", "cloud-upload", "share",
      "share-2", "reply", "forward", "link", "link-2", "unlink", "external-link", "log-in",
      "log-out", "refresh-cw", "refresh-ccw", "rotate-cw", "rotate-ccw", "repeat", "undo", "redo",
      "undo-2", "redo-2",
    ],
  },
  {
    label: "Interface",
    sources: [
      "menu", "ellipsis", "ellipsis-vertical", "settings", "settings-2", "cog", "funnel",
      "sliders-horizontal", "sliders-vertical", "toggle-left", "toggle-right",
      "text-cursor-input", "type", "text-align-start", "text-align-center", "text-align-justify",
      "list", "list-checks", "list-ordered", "list-tree", "layout-list", "layout-dashboard",
      "layout-grid", "panels-top-left", "panel-right", "columns-2", "app-window", "layers",
      "grip", "grip-vertical", "grip-horizontal", "zoom-in", "zoom-out", "maximize", "minimize",
      "maximize-2", "minimize-2", "expand", "shrink", "hand", "hand-grab",
    ],
  },
  {
    label: "Status & shapes",
    sources: [
      "check", "square-check", "circle-check", "circle-check-big", "circle-x", "circle-dot",
      "circle-alert", "triangle-alert", "info", "circle-question-mark", "circle-plus",
      "circle-minus", "circle-dashed", "loader", "loader-circle", "star", "star-half", "heart",
      "bookmark", "flag", "award", "medal", "trophy", "badge", "badge-check", "sparkles", "gem",
      "crown", "square-x", "square-plus", "square-pen", "square-arrow-out-up-right", "equal",
      "divide", "percent", "hash", "asterisk", "circle", "square", "triangle", "diamond",
      "hexagon", "octagon", "pentagon",
    ],
  },
  {
    label: "Files & documents",
    sources: [
      "file", "file-text", "file-input", "file-output", "file-plus", "file-check", "file-x",
      "files", "file-code", "file-image", "file-pen", "file-search", "folder", "folder-open",
      "folder-plus", "folder-check", "archive", "clipboard", "clipboard-list", "clipboard-check",
      "clipboard-copy", "book", "book-open", "book-open-text", "library", "newspaper",
      "scroll-text", "sticky-note", "notebook", "printer", "paperclip",
    ],
  },
  {
    label: "People & communication",
    sources: [
      "user", "users", "user-plus", "user-check", "user-x", "user-round", "users-round",
      "user-cog", "circle-user", "group", "contact", "id-card", "mail", "mail-open", "mail-plus",
      "inbox", "send", "message-circle", "message-square", "message-square-text",
      "message-square-warning", "messages-square", "phone", "phone-call", "phone-off", "bell",
      "bell-off", "bell-ring", "at-sign", "rss", "megaphone", "smile", "frown", "meh",
      "thumbs-up", "thumbs-down", "heart-handshake", "handshake",
    ],
  },
  {
    label: "Security",
    sources: [
      "lock", "lock-open", "key-round", "shield", "shield-check", "shield-alert", "eye",
      "eye-off", "scan", "scan-line", "qr-code",
    ],
  },
  {
    label: "Commerce & places",
    sources: [
      "house", "building", "building-2", "store", "landmark", "warehouse", "factory", "globe",
      "earth", "box", "credit-card", "wallet", "coins", "dollar-sign", "euro", "banknote",
      "receipt", "shopping-cart", "shopping-bag", "gift", "tag", "tags", "ticket", "piggy-bank",
      "briefcase",
    ],
  },
  {
    label: "Objects & tools",
    sources: [
      "wrench", "hammer", "drill", "ruler", "pencil-ruler", "paintbrush", "brush", "palette",
      "pipette", "pen-tool", "feather", "wand", "wand-sparkles", "blend", "rocket", "anchor",
      "life-buoy", "graduation-cap", "truck", "ship", "plane", "car", "bike", "train-front",
      "fuel",
    ],
  },
  {
    label: "Time",
    sources: [
      "calendar", "calendar-days", "calendar-check", "calendar-clock", "clock", "clock-3",
      "timer", "alarm-clock", "hourglass", "watch", "history",
    ],
  },
  {
    label: "Media",
    sources: [
      "image", "images", "camera", "video", "film", "clapperboard", "music", "play", "pause",
      "square-play", "circle-play", "skip-forward", "skip-back", "rewind", "fast-forward",
      "volume", "volume-1", "volume-2", "volume-x", "mic", "mic-off", "headphones", "speaker",
      "radio", "disc", "podcast",
    ],
  },
  {
    label: "Nature & weather",
    sources: [
      "sun", "moon", "cloud", "cloud-rain", "cloud-snow", "cloud-sun", "cloud-lightning", "wind",
      "snowflake", "droplet", "droplets", "umbrella", "thermometer", "flame", "rainbow",
      "sunrise", "sunset", "leaf", "trees", "flower", "sprout", "tree-pine", "bird", "dog", "cat",
      "fish",
    ],
  },
  {
    label: "Devices",
    sources: [
      "smartphone", "tablet", "laptop", "monitor", "keyboard", "mouse", "mouse-pointer-click",
      "pointer", "wifi", "wifi-off", "bluetooth", "battery", "battery-full", "battery-low",
      "battery-charging", "power", "plug", "plug-zap", "zap", "cpu", "server", "hard-drive",
      "memory-stick", "usb", "cast",
    ],
  },
  {
    label: "Development & data",
    sources: [
      "code", "code-xml", "terminal", "square-terminal", "braces", "brackets", "bug", "binary",
      "command", "bot", "variable", "git-branch", "git-commit-horizontal", "git-merge",
      "git-pull-request", "git-compare", "database", "table", "activity", "gauge", "chart-line",
      "chart-no-axes-column", "chart-area", "chart-pie", "chart-column", "chart-bar",
      "trending-up", "trending-down", "target", "crosshair", "scale", "calculator", "sigma",
    ],
  },
  {
    label: "Health & everyday",
    sources: [
      "heart-pulse", "stethoscope", "pill", "syringe", "cross", "accessibility", "baby",
      "footprints", "lightbulb", "flashlight", "coffee", "utensils", "apple", "carrot",
    ],
  },
];

/** Every source name, across the categories. */
export const SOURCES: string[] = CATEGORIES.flatMap((category) => category.sources);

/** Argus reference paths replace upstream outlines in the existing glyph set. */
export const REFERENCE_PATHS: Record<string, string> = {
  "search": "M11 3a8 8 0 1 0 0 16 8 8 0 1 0 0-16M21 21l-4.35-4.35",
  "bell": "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  "chevronDown": "M6 9l6 6 6-6",
  "chevronRight": "M9 6l6 6-6 6",
  "chevronLeft": "M15 6l-6 6 6 6",
  "externalLink": "M7 17L17 7M8 7h9v9",
  "x": "M18 6L6 18M6 6l12 12",
  "layoutGrid": "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  "list": "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  "mapPin": "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 7a3 3 0 1 0 0 6 3 3 0 1 0 0-6",
  "activity": "M22 12h-4l-3 9L9 3l-3 9H2",
  "arrowRight": "M5 12h14M12 5l7 7-7 7",
  "columns2": "M3 3h7v18H3zM14 3h7v10h-7z",
  "gitPullRequest": "M6 3v12M6 15a3 3 0 1 0 0 6 3 3 0 1 0 0-6M18 3a3 3 0 1 0 0 6 3 3 0 1 0 0-6M18 9a9 9 0 0 1-9 9",
  "circleCheck": "M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4L12 14l-3-3",
  "barChart2": "M18 20V10M12 20V4M6 20v-6",
  "users": "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 1 0 0-8M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  "squarePlus": "M12 8v8M8 12h8M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
  "target": "M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20M12 8a4 4 0 1 0 0 8 4 4 0 1 0 0-8",
  "layers": "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  "archive": "M21 8v13H3V8M1 3h22v5H1zM10 12h4",
  "menu": "M3 6h18M3 12h18M3 18h18",
  "check": "M20 6L9 17l-5-5",
  "plus": "M12 5v14M5 12h14",
  "filter": "M22 3H2l8 9.46V19l4 2v-8.54L22 3z"
};
