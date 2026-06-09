import { COMPONENTS } from "./components";
import type { SearchEntry } from "./types";

const GUIDE_ENTRIES: SearchEntry[] = [
  { title: "Home", description: "Canvas design system overview", path: "/", category: "Pages", keywords: ["overview", "getting started", "install"] },
  { title: "Tokens", description: "Design token reference (colors, typography, spacing)", path: "/tokens", category: "Foundations", keywords: ["colors", "fonts", "spacing", "radius", "shadows", "custom properties", "variables"] },
  { title: "Theming", description: "Light/dark mode, glass surface, density controls", path: "/theming", category: "Guides", keywords: ["dark mode", "light mode", "glass", "compact", "comfy", "theme"] },
  { title: "Migration", description: "Moving from the CSS-first design system to the universal React Native kit", path: "/migration", category: "Guides", keywords: ["upgrade", "css framework", "react native", "boolean props", "breaking changes", "btn", "card"] },
  { title: "Integration", description: "Consumer integration guide for downstream packages", path: "/integration", category: "Guides", keywords: ["react", "vue", "downstream", "consumer"] },
  { title: "Browser Support", description: "CSS feature matrix and minimum browser versions", path: "/browser-support", category: "Guides", keywords: ["browsers", "compatibility", "css features"] },
  { title: "React Native primitives", description: "Engine-styled primitives (Box, Text, Pressable, Image, TextInput, Scroll) and the react-native boundary", path: "/rn-primitives", category: "Guides", keywords: ["react native", "react-native-web", "rnw", "primitives", "scroll", "image", "textinput", "view", "native", "peer dependency"] },
];

const ALL_ENTRIES: SearchEntry[] = [
  ...GUIDE_ENTRIES,
  ...COMPONENTS.map((c) => ({
    title: c.name,
    description: c.description,
    path: `/components/${c.slug}`,
    category: c.category,
    keywords: [c.slug, ...c.slug.split("-")],
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
