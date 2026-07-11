// Source of truth for the Canvas Icon glyph set. `tools/icongen/generate.ts`
// reads this list plus lucide-static's `icon-nodes.json` and regenerates the
// ICONS map, the NAMES gallery list, and the name-boolean props in
// `src/atoms/icon/icon.shared.tsx` (between the ICONGEN markers). To add glyphs,
// add their Lucide (kebab-case) name to SOURCES and run `bun run icons:gen`.
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

/** The curated Lucide source names to ship (kebab-case). Grouped for readability.
 *  Add here to enrich the set. */
export const SOURCES: string[] = [
  // --- the required-existing set, by Lucide source name (aliases resolve names) ---
  "activity", "triangle-alert", "text-align-start", "app-window", "archive", "arrow-right",
  "award", "chart-no-axes-column", "bell", "book-open", "box", "calendar", "chart-line",
  "check", "square-check", "chevron-down", "chevron-left", "chevron-right", "chevrons-left",
  "circle-check", "circle-dot", "circle-x", "code", "columns-2", "copy", "database",
  "download", "eye", "file", "file-input", "file-text", "funnel", "folder", "footprints",
  "gauge", "git-compare", "globe", "group", "house", "image", "inbox", "info", "key-round",
  "keyboard", "layers", "panels-top-left", "layout-grid", "list", "list-checks", "loader",
  "lock", "log-out", "mail", "menu", "message-circle", "message-square-warning", "minus",
  "moon", "ellipsis", "mouse-pointer-click", "move-vertical", "navigation", "palette",
  "panel-right", "pencil", "plug", "plus", "pointer", "rocket", "save", "search", "settings",
  "shield", "smartphone", "square", "star", "sun", "table", "terminal", "text-cursor-input",
  "toggle-left", "trash", "type", "upload", "user", "users", "x", "zap",

  // --- navigation / direction ---
  "arrow-up", "arrow-down", "arrow-left", "arrow-up-right", "arrow-down-right", "arrow-up-left",
  "arrow-down-left", "chevron-up", "chevrons-up-down", "chevrons-left-right", "chevrons-right",
  "corner-down-right", "move", "move-horizontal", "move-3d", "maximize", "minimize",
  "maximize-2", "minimize-2", "expand", "shrink", "refresh-cw", "refresh-ccw", "rotate-cw",
  "rotate-ccw", "repeat", "undo", "redo", "undo-2", "redo-2", "compass", "locate", "route",
  "milestone", "map", "map-pin", "flag-triangle-right",

  // --- status / symbols ---
  "equal", "divide", "percent", "hash", "asterisk", "circle-plus", "circle-minus", "circle",
  "circle-question-mark", "circle-alert", "circle-check-big", "square-x", "square-plus",
  "square-pen", "square-arrow-out-up-right", "triangle", "diamond", "hexagon", "octagon",
  "heart", "bookmark", "flag", "pentagon", "badge", "badge-check", "sparkles", "gem", "crown",

  // --- files / documents ---
  "file-plus", "file-check", "file-x", "files", "file-code", "file-output", "file-image",
  "file-pen", "file-search", "folder-open", "folder-plus", "folder-check", "clipboard",
  "clipboard-list", "clipboard-check", "clipboard-copy", "scissors", "trash-2", "pen",
  "eraser", "book", "book-open-text", "library", "newspaper", "scroll-text", "sticky-note",
  "notebook", "pencil-ruler", "printer", "paperclip",

  // --- people / communication ---
  "user-plus", "user-check", "user-x", "user-round", "users-round", "user-cog", "contact",
  "id-card", "mail-open", "mail-plus", "send", "message-square", "message-square-text",
  "messages-square", "phone", "phone-call", "phone-off", "bell-off", "bell-ring", "at-sign",
  "reply", "forward", "share", "share-2", "rss", "megaphone", "smile", "frown", "meh",
  "thumbs-up", "thumbs-down", "heart-handshake", "handshake",

  // --- ui / editing ---
  "zoom-in", "zoom-out", "list-ordered", "list-tree", "layout-list", "layout-dashboard",
  "ellipsis-vertical", "grip", "grip-vertical", "grip-horizontal", "text-align-center",
  "text-align-justify", "sliders-horizontal", "sliders-vertical", "cog", "wand-sparkles",
  "loader-circle", "circle-user", "life-buoy", "medal", "trophy", "wand",

  // --- security ---
  "eye-off", "lock-open", "shield-check", "shield-alert", "scan", "scan-line", "qr-code",

  // --- places / commerce ---
  "building", "building-2", "store", "landmark", "warehouse", "credit-card", "wallet",
  "coins", "dollar-sign", "euro", "banknote", "receipt", "shopping-cart", "shopping-bag",
  "gift", "tag", "tags", "ticket", "piggy-bank", "briefcase", "factory",

  // --- transport / objects ---
  "truck", "ship", "plane", "car", "bike", "train-front", "anchor", "fuel", "wrench",
  "hammer", "drill", "ruler", "paintbrush", "brush", "pipette", "graduation-cap", "pen-tool",
  "feather",

  // --- time ---
  "calendar-days", "calendar-check", "calendar-clock", "clock", "clock-3", "timer",
  "alarm-clock", "hourglass", "watch", "history",

  // --- media ---
  "images", "camera", "video", "film", "clapperboard", "music", "play", "pause", "square-play",
  "circle-play", "skip-forward", "skip-back", "rewind", "fast-forward", "volume", "volume-1",
  "volume-2", "volume-x", "mic", "mic-off", "headphones", "speaker", "radio", "disc", "podcast",

  // --- weather / nature ---
  "cloud", "cloud-rain", "cloud-snow", "cloud-sun", "cloud-lightning", "wind", "snowflake",
  "droplet", "droplets", "umbrella", "thermometer", "flame", "rainbow", "sunrise", "sunset",
  "star-half", "leaf", "trees", "flower", "sprout", "tree-pine", "bird", "dog", "cat", "fish",

  // --- devices / tech ---
  "wifi", "wifi-off", "bluetooth", "battery", "battery-full", "battery-low", "battery-charging",
  "power", "cpu", "server", "hard-drive", "memory-stick", "monitor", "tablet", "laptop", "mouse",
  "usb", "cast", "plug-zap",

  // --- dev / data ---
  "git-branch", "git-commit-horizontal", "git-merge", "git-pull-request", "code-xml",
  "square-terminal", "braces", "brackets", "bug", "binary", "command", "bot", "variable",
  "trending-up", "trending-down", "chart-area", "chart-pie", "chart-column", "chart-bar",
  "target", "crosshair", "scale", "calculator", "sigma",

  // --- misc / health / actions ---
  "heart-pulse", "stethoscope", "pill", "syringe", "cross", "accessibility", "baby",
  "lightbulb", "flashlight", "coffee", "utensils", "apple", "carrot", "settings-2", "toggle-right",
  "link", "link-2", "unlink", "external-link", "cloud-download", "cloud-upload", "log-in",
  "hand", "hand-grab", "circle-dashed", "earth",
];
