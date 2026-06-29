import { COMPONENTS } from "./components";
import { getAllPatterns } from "./patterns";
import { getAllTemplates } from "./templates";
import type { SearchEntry } from "./types";

// Static guide + foundation + token entries. These mirror the routes the docs app
// actually exposes (the RN app has richer token pages than the original web docs:
// colors, spacing, typography, and layout are each their own route), so a path here
// always resolves to a real page on every platform.
const GUIDE_ENTRIES: SearchEntry[] = [
  { title: "Home", description: "Canvas design system overview", path: "/", category: "Pages", keywords: ["overview", "getting started", "install", "about"] },
  { title: "All components", description: "Browse every Canvas component by category", path: "/components", category: "Pages", keywords: ["index", "list", "catalog", "browse"] },
  { title: "Colors & Theme", description: "Color tokens, light/dark scheme, and the glass surface", path: "/tokens/colors", category: "Foundations", keywords: ["colors", "theme", "tokens", "custom properties", "variables", "dark", "light"] },
  { title: "Spacing & Shape", description: "Spacing scale, radius, and shadow tokens", path: "/tokens/spacing", category: "Foundations", keywords: ["spacing", "gap", "radius", "rounded", "shadow", "shape", "tokens"] },
  { title: "Typography", description: "Type scale, font families, and text tokens", path: "/tokens/typography", category: "Foundations", keywords: ["typography", "fonts", "type", "text", "geist", "tokens"] },
  { title: "Layout & Flexbox", description: "Flexbox layout helpers and the responsive layout tokens", path: "/tokens/layout", category: "Foundations", keywords: ["layout", "flexbox", "flex", "grid", "responsive", "tokens"] },
  { title: "Theming", description: "Light/dark mode, glass surface, density controls", path: "/theming", category: "Guides", keywords: ["dark mode", "light mode", "glass", "compact", "comfy", "theme", "density"] },
  { title: "Integration", description: "Install and consume Canvas, the universal React Native kit, on native and the web", path: "/integration", category: "Guides", keywords: ["react", "react native", "react-native-web", "install", "setup", "native", "web"] },
  { title: "React Native", description: "Engine-styled primitives (View, Text, Pressable, Image, TextInput, ScrollView) and the react-native boundary", path: "/rn-primitives", category: "Guides", keywords: ["react native", "react-native-web", "rnw", "primitives", "scroll", "image", "textinput", "view", "native", "peer dependency"] },
  { title: "Browser Support", description: "Supported platforms (iOS, Android, web) and the web browser baseline", path: "/browser-support", category: "Guides", keywords: ["platforms", "ios", "android", "web", "react-native-web", "browsers", "compatibility"] },
];

// The full searchable index: the static guide entries plus every component, pattern,
// and template, sourced from the docs core data so the index stays in sync with the
// pages that actually exist. The paths match the RN routes exactly.
const ALL_ENTRIES: SearchEntry[] = [
  ...GUIDE_ENTRIES,
  ...COMPONENTS.map((c) => ({
    title: c.name,
    description: c.description,
    path: `/components/${c.slug}`,
    category: c.category,
    // Keep the source-dir name searchable too, so "sidebar"/"switch" still find the
    // renamed Navigation/Toggle pages.
    keywords: [c.slug, ...c.slug.split("-"), ...(c.dir ? [c.dir] : [])],
  })),
  ...getAllPatterns().map((p) => ({
    title: p.name,
    description: p.description,
    path: `/patterns/${p.slug}`,
    category: "Patterns",
    keywords: [p.slug, ...p.slug.split("-")],
  })),
  ...getAllTemplates().map((t) => ({
    title: t.name,
    description: t.description,
    path: `/templates/${t.slug}`,
    category: "Templates",
    keywords: [t.slug, ...t.slug.split("-")],
  })),
];

// Case-insensitive match across title, description, category, and keywords, ranked
// BEST MATCH FIRST: an exact title beats a title prefix beats a title substring beats a
// keyword hit beats a description/category-only hit; ties break alphabetically. Returns up
// to 20 hits, which the UI groups by category. The relevance order is what makes the
// command palette feel right (the closest match is the first, pre-highlighted row).
function relevance(entry: SearchEntry, q: string): number {
  const t = entry.title.toLowerCase();
  if (t === q) return 5;
  if (t.startsWith(q)) return 4;
  if (t.includes(q)) return 3;
  if (entry.keywords.some((k) => k.toLowerCase().startsWith(q))) return 2;
  if (
    entry.description.toLowerCase().includes(q) ||
    entry.category.toLowerCase().includes(q) ||
    entry.keywords.some((k) => k.toLowerCase().includes(q))
  )
    return 1;
  return 0;
}

export function search(query: string): SearchEntry[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return ALL_ENTRIES.map((entry) => ({ entry, score: relevance(entry, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, 20)
    .map((x) => x.entry);
}

export { ALL_ENTRIES, GUIDE_ENTRIES };
