import { COMPONENTS } from "./components";
import type { SearchEntry } from "./types";

const GUIDE_ENTRIES: SearchEntry[] = [
  { title: "Home", description: "Canvas design system overview", path: "/", category: "Pages", keywords: ["overview", "getting started", "install"] },
  { title: "Tokens", description: "Design token reference (colors, typography, spacing)", path: "/tokens/colors", category: "Foundations", keywords: ["colors", "fonts", "spacing", "radius", "shadows", "custom properties", "variables"] },
  { title: "Theming", description: "Light/dark mode, glass surface, density controls", path: "/theming", category: "Guides", keywords: ["dark mode", "light mode", "glass", "compact", "comfy", "theme"] },
  { title: "Integration", description: "Install and consume Canvas, the universal React Native kit, on native and the web", path: "/integration", category: "Guides", keywords: ["react", "react native", "react-native-web", "install", "setup", "native", "web"] },
  { title: "Browser Support", description: "Supported platforms (iOS, Android, web) and the web browser baseline", path: "/browser-support", category: "Guides", keywords: ["platforms", "ios", "android", "web", "react-native-web", "browsers", "compatibility"] },
  { title: "React Native primitives", description: "Engine-styled primitives (View, Text, Pressable, Image, TextInput, ScrollView) and the react-native boundary", path: "/rn-primitives", category: "Guides", keywords: ["react native", "react-native-web", "rnw", "primitives", "scroll", "image", "textinput", "view", "native", "peer dependency"] },
];

const ALL_ENTRIES: SearchEntry[] = [
  ...GUIDE_ENTRIES,
  ...COMPONENTS.map((c) => ({
    title: c.name,
    description: c.description,
    path: `/components/${c.slug}`,
    category: c.category,
    // Keep the source-dir name searchable too, so "sidebar"/"switch" still
    // find the renamed Navigation/Toggle pages.
    keywords: [c.slug, ...c.slug.split("-"), ...(c.dir ? [c.dir] : [])],
  })),
];

export function search(query: string): SearchEntry[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return ALL_ENTRIES.filter((entry) => {
    if (entry.title.toLowerCase().includes(q)) return true;
    if (entry.description.toLowerCase().includes(q)) return true;
    if (entry.category.toLowerCase().includes(q)) return true;
    return entry.keywords.some((k) => k.toLowerCase().includes(q));
  }).slice(0, 20);
}
