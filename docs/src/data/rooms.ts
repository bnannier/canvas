import { COMPONENTS } from "../core/data/components";
import { SECTIONS, type Section } from "../core/data/detail-sections";
import { routeItem } from "./nav";

// The docs' rooms: the v4 hand-off's eight sections (canvas-docs.js `rooms`), each holding
// its components in the hand-off's order, plus a Guides room for the token, theming and
// reference pages the hand-off has no section for. The web shell reads it three ways: the
// pill navbar's ten links (the eight sections, Skins and Templates, ./pill-nav), the rail
// beside a page of a room (its rows), and the footer's Guides column. A component's room
// is its `section` (docs/src/core/data/components.ts, generated from the hand-off).
//
// Plain data with no React import, so the unit tests read it without a kit build.

export type SectionId = "foundations" | "layout" | "controls" | "inputs" | "navigation" | "data" | "charts" | "overlays";
export type RoomId = SectionId | "guides";

export interface RoomItem {
  /** The row's id: a component's URL slug, or a guide's nav registry key. */
  id: string;
  label: string;
  href: string;
}

export interface Room {
  id: RoomId;
  /** The pill's link label (the hand-off's: "Data", "Overlays"). */
  label: string;
  /** The page title, and the rail's heading (the hand-off's: "Surfaces & data"). */
  title: string;
  /** The hand-off's one-line lead under the title (its 22 px display line). */
  lead: string;
  /**
   * The section page's paragraph under the lead (the hand-off's 17 px body), with a code
   * span in backticks (inline Markdown, docs/src/lib/inline-markdown.ts). Section rooms only.
   */
  body?: string;
  /** The room's own page, where it has one. */
  href?: string;
  items: RoomItem[];
}

// The hand-off's section pages (`Canvas v4.0.0 <Section>.dc.html`): each section's pill
// label, its title, its lead line and the paragraph under it, by the hand-off's section
// title. Foundations' glyph count is the kit's own (test/docs-rooms.test.ts holds it to
// src/atoms/icon/icon.glyphs.ts), written here so the shell does not load the glyph table.
const SECTION_COPY: Record<Section, { id: SectionId; label: string; lead: string; body: string }> = {
  Foundations: {
    id: "foundations",
    label: "Foundations",
    lead: "Tokens that render the same on a phone and in a browser.",
    body: "Two neutral ramps, one accent, three faces, one spring and 414 glyphs. Every value lives in `src/style/tokens.ts`.",
  },
  Layout: {
    id: "layout",
    label: "Layout",
    lead: "Components never pick a width. The layout hands them one.",
    body: "Every component fills or hugs the bounds its parent provides. Anything that changes shape measures its own container, never the window. Only app chrome reads the viewport.",
  },
  Controls: {
    id: "controls",
    label: "Controls",
    lead: "Buttons, toggles and sliders. The things a thumb touches.",
    body: "Everything here is live. Press, drag and toggle. Every control springs; the primary fill glows only when it moves.",
  },
  Inputs: {
    id: "inputs",
    label: "Inputs",
    lead: "Fields that light up when they're listening.",
    body: "A recessed fill, a hairline, and a 4px ion ring on focus. Labels sit above; helper text below. The component owns all of it.",
  },
  Navigation: {
    id: "navigation",
    label: "Navigation",
    lead: "Wayfinding that slides instead of snapping.",
    body: "Indicators are physical objects: a glass thumb, a glowing underline. They travel to the new position on the spring.",
  },
  "Surfaces & data": {
    id: "data",
    label: "Data",
    lead: "Cards, stats, charts and tables on one lit surface.",
    body: "Content panes take the denser glass tint so text keeps its contrast. Numbers are tabular, marks are the ion, and the chart series never renumber.",
  },
  Charts: {
    id: "charts",
    label: "Charts",
    lead: "27 chart types, one series palette, no charting library.",
    body: "Marks are the ion and its seven fixed neighbours; series never renumber when one is filtered out. Every plot fills its container and inspects on press or scrub.",
  },
  "Overlays & feedback": {
    id: "overlays",
    label: "Overlays",
    lead: "Glass over the app, never a curtain.",
    body: "Dialogs, drawers and toasts sit on the densest tint so the page stays legible underneath. They rise 16px on entry and settle, not fade.",
  },
};

const NAME_OF = new Map(COMPONENTS.map((c) => [c.slug, c.name] as const));

/** The eight section rooms, in the hand-off's order. */
export const SECTION_ROOMS: readonly Room[] = SECTIONS.map(({ title, slugs }) => {
  const copy = SECTION_COPY[title];
  return {
    id: copy.id,
    label: copy.label,
    title,
    lead: copy.lead,
    body: copy.body,
    href: `/sections/${copy.id}`,
    items: slugs
      .filter((slug) => NAME_OF.has(slug))
      .map((slug) => ({ id: slug, label: NAME_OF.get(slug)!, href: `/components/${slug}` })),
  };
});

/** The nav registry keys of the Guides room's pages, in reading order. */
const GUIDE_KEYS = ["colors", "spacing", "typography", "layout", "theming", "integration", "browser", "rn", "privacy", "licenses"] as const;

/** The token, theming and reference pages. */
export const GUIDES_ROOM: Room = {
  id: "guides",
  label: "Guides",
  title: "Guides",
  lead: "Tokens, theming and the reference pages.",
  items: GUIDE_KEYS.map((key) => {
    const route = routeItem(key);
    return { id: key, label: route.label, href: route.href };
  }),
};

export const ROOMS: readonly Room[] = [...SECTION_ROOMS, GUIDES_ROOM];

/** The section room with this URL id (`/sections/<id>`). */
export function getSectionRoom(id: string): Room | undefined {
  return SECTION_ROOMS.find((room) => room.id === id);
}

/** The hand-off's Skins page: the pill's ninth link (a stub until Phase 7). */
export const SKINS_PAGE = {
  href: "/skins",
  title: "Platform skins",
  lead: "One tree. iOS capsule, Material stadium, Canvas web.",
} as const;

/** The Templates index: the pill's tenth link. */
export const TEMPLATES_PAGE = {
  href: "/templates",
  title: "Templates",
  lead: "Whole screens composed from Canvas components.",
} as const;

/** The pill's ten links, in the hand-off's order: the eight sections, Skins, Templates. */
export const PILL_LINKS: readonly { label: string; href: string }[] = [
  ...SECTION_ROOMS.map((room) => ({ label: room.label, href: room.href! })),
  { label: "Skins", href: SKINS_PAGE.href },
  { label: "Templates", href: TEMPLATES_PAGE.href },
];

function stripTrailingSlash(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

/**
 * Where a path sits among the rooms: its room, and the row it is (a component's slug or a
 * guide's key) when it is one of the room's pages rather than the room's own page. Null
 * for a page outside every room (home, the catalog, Skins, Templates, the patterns).
 */
export function roomFor(pathname: string): { room: Room; active?: string } | null {
  const path = stripTrailingSlash(pathname);
  const section = path.match(/^\/sections\/([^/]+)$/);
  if (section) {
    const room = getSectionRoom(section[1]);
    return room ? { room } : null;
  }
  const component = path.match(/^\/components\/([^/]+)/);
  if (component) {
    const room = SECTION_ROOMS.find((r) => r.items.some((item) => item.id === component[1]));
    return room ? { room, active: component[1] } : null;
  }
  const guide = GUIDES_ROOM.items.find((item) => item.href === path);
  return guide ? { room: GUIDES_ROOM, active: guide.id } : null;
}

/** The pill link a path lights (an index into {@link PILL_LINKS}), or -1 for none. */
export function pillIndexFor(pathname: string): number {
  const path = stripTrailingSlash(pathname);
  if (path === SKINS_PAGE.href) return SECTION_ROOMS.length;
  if (path === TEMPLATES_PAGE.href || path.startsWith(`${TEMPLATES_PAGE.href}/`)) return SECTION_ROOMS.length + 1;
  const place = roomFor(path);
  if (!place || place.room.id === "guides") return -1;
  return SECTION_ROOMS.indexOf(place.room);
}
