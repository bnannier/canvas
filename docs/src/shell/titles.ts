import { getComponent } from "../core/data/components";
import { getTemplate } from "../core/data/templates";
import { getPattern } from "../core/data/patterns";
import { getSectionRoom, SKINS_PAGE, TEMPLATES_PAGE } from "../data/rooms";

// A route's title and its subtitle (the place it belongs to), for the native navigation
// bar (./native-header.tsx). The web shell shows no page title in its chrome: the pill
// names the room and each page its own H1.

function titleize(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const STATIC_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/": { title: "Canvas", subtitle: "Design System" },
  "/components": { title: "All components", subtitle: "Overview" },
  "/tokens/colors": { title: "Colors & Theme", subtitle: "Tokens" },
  "/tokens/spacing": { title: "Spacing & Shape", subtitle: "Tokens" },
  "/tokens/typography": { title: "Typography", subtitle: "Tokens" },
  "/tokens/layout": { title: "Layout & Flexbox", subtitle: "Tokens" },
  "/theming": { title: "Theming", subtitle: "Foundations" },
  "/integration": { title: "Integration", subtitle: "Guides" },
  "/browser-support": { title: "Browser Support", subtitle: "Guides" },
  "/rn-primitives": { title: "React Native", subtitle: "Guides" },
  "/privacy": { title: "Privacy Policy", subtitle: "Guides" },
  "/licenses": { title: "Open Source Licenses", subtitle: "Guides" },
  "/boilerplate": { title: "Boilerplate", subtitle: "Overview" },
  [SKINS_PAGE.href]: { title: SKINS_PAGE.title, subtitle: "Overview" },
  [TEMPLATES_PAGE.href]: { title: TEMPLATES_PAGE.title, subtitle: "Overview" },
};

export function titleFor(pathname: string): { title: string; subtitle?: string } {
  if (STATIC_TITLES[pathname]) return STATIC_TITLES[pathname];
  const seg = pathname.split("/").filter(Boolean);
  if (seg[0] === "components" && seg[1]) {
    const c = getComponent(seg[1]);
    if (c) return { title: c.name, subtitle: c.section };
  }
  if (seg[0] === "sections" && seg[1]) {
    const room = getSectionRoom(seg[1]);
    if (room) return { title: room.title, subtitle: "Sections" };
  }
  if (seg[0] === "templates" && seg[1]) return { title: getTemplate(seg[1])?.name ?? titleize(seg[1]), subtitle: "Templates" };
  if (seg[0] === "patterns" && seg[1]) return { title: getPattern(seg[1])?.name ?? titleize(seg[1]), subtitle: "Patterns" };
  return { title: "Canvas" };
}
