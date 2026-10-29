import { COMPONENTS } from "../core/data/components";
import { SECTION_ROOMS, TEMPLATES_PAGE, type SectionId } from "./rooms";
import { TIER_LABELS, tierOf, type Tier } from "./tiers";
import { PLATFORM_COPY } from "./platform-copy";

// The docs home: the v4 hand-off's Library page (`tools/v4/handoff/Canvas v4.0.0
// Library.dc.html`), its copy and its index as data. docs/src/shell/home.tsx draws it from
// kit components and the brand illustrations in docs/src/brand; test/docs-library.test.ts
// holds it to the hand-off and to the kit's real exports.
//
// The headline is the owner's slogan, "Made of light." (2026-10-28), over the hand-off's
// "Light as material.". Where the hand-off's copy says something Canvas does not do, the copy is Canvas's own:
// the kit removed its spring motion on 2026-09-21 (CLAUDE.md "Motion"), so the hero
// paragraph says "functional motion" and the fourth principle describes the motion that
// stayed. Every count is read from the registries, never written in.
//
// Plain data with no React import, so the unit tests read it without a kit build.

export const REPO_URL = "https://github.com/bnannier/canvas";

/** The hero: the eyebrow, the headline in its two parts, the paragraph and the two calls. */
export const LIBRARY_HERO = {
  /** The eyebrow after the version: "Canvas v4.0.0 · Component library". */
  eyebrow: (version: string) => `Canvas v${version} · Component library`,
  /** The headline's plain part, then its gradient word. The h1's accessible name is both. */
  headline: { plain: "Made of", accent: "light." },
  /** Names the platforms, so it is per build (./platform-copy). */
  body: PLATFORM_COPY.heroBody,
  primary: { label: "Explore components", href: "/controls" },
  secondary: { label: "bnannier/canvas", url: REPO_URL },
} as const;

/** The full headline, the h1's accessible name. */
export const LIBRARY_HEADLINE = `${LIBRARY_HERO.headline.plain} ${LIBRARY_HERO.headline.accent}`;

/** The mono stats row under the calls. */
export function heroStats(componentCount: number = COMPONENTS.length): readonly string[] {
  return [`${componentCount} components`, "2 schemes", PLATFORM_COPY.heroSkins, "1 accent, rebrandable"];
}

export interface Principle {
  num: string;
  title: string;
  body: string;
}

/** The four direction cards under the hero (the hand-off's `data-screen-label="Direction"`). */
export const PRINCIPLES: readonly Principle[] = [
  {
    num: "01",
    title: "Light is the material",
    body: "Surfaces are lit glass: a translucent fill, a 1px top highlight, depth from one soft ambient shadow. Nothing is flat and nothing is gradient-heavy.",
  },
  {
    num: "02",
    title: "One charged accent",
    body: "A single ion hue does every job: fill, focus, selection, glow. It is one oklch token, so rebranding is one value and the palette stays in gamut. Try the dots in the nav.",
  },
  {
    num: "03",
    title: "Type carries hierarchy",
    body: "Bricolage Grotesque for display and titles, Instrument Sans for UI, JetBrains Mono for anything a machine reads. Size and weight do the work, not color.",
  },
  {
    num: "04",
    title: "Motion has a job",
    body: "Spinners, shimmers, disclosures and sheets move; nothing decorates. Hover lifts run in the compositor, and Reduce Motion stills everything that is not essential.",
  },
];

/**
 * The Index heading, its lead line and its paragraph (the mono package name is its own run).
 * The owner's copy (2026-10-28) over the hand-off's "Index" caption: the heading advertises
 * the kit's size, counted from the registry.
 */
export const INDEX_COPY = {
  title: (count: number = COMPONENTS.length) => `${count} components`,
  lead: PLATFORM_COPY.indexLead,
  body: {
    before: "Every one is in ",
    mono: "@nannier/canvas",
    after: PLATFORM_COPY.indexAfter,
  },
} as const;

export interface IndexItem {
  slug: string;
  name: string;
  href: string;
  tier: Tier;
}

export interface IndexColumn {
  id: SectionId;
  /** The room's number, "01" to "08". */
  num: string;
  title: string;
  href: string;
  items: readonly IndexItem[];
}

/**
 * The Index: one column per section room, its components in the room's order, each tagged
 * with its tier. The hand-off numbers Surfaces & data and Charts both "06" (a typo in its
 * IDX table); the rooms here are numbered in order, 01 to 08.
 */
export const LIBRARY_INDEX: readonly IndexColumn[] = SECTION_ROOMS.map((room, index) => ({
  id: room.id as SectionId,
  num: String(index + 1).padStart(2, "0"),
  title: room.title,
  href: room.href!,
  items: room.items.map((item) => {
    const tier = tierOf(item.id);
    if (!tier) throw new Error(`docs/src/data/library.ts: ${item.id} has no tier`);
    return { slug: item.id, name: item.label, href: item.href, tier };
  }),
}));

/** The tier legend under the Index, in the hand-off's order, with its words. */
export const TIER_LEGEND: readonly { tier: Tier; letter: string; label: string }[] = [
  { tier: "atom", letter: "A", label: "atom" },
  { tier: "molecule", letter: "M", label: "molecule" },
  { tier: "organism", letter: "O", label: "organism" },
  { tier: "chart", letter: "C", label: "chart" },
  { tier: "primitive", letter: "P", label: "React Native primitive, re-exported unskinned" },
];

/** A tier's one-letter tag, as the legend and the Index rows print it. */
export function tierLetter(tier: Tier): string {
  return TIER_LABELS[tier][0]!;
}

export interface SubComponentGroup {
  /** The parent components, as the hand-off names them. */
  parent: string;
  /** The parent's component page. */
  href: string;
  /** The sub-components: real exports of `@nannier/canvas`. */
  names: readonly string[];
}

/**
 * The sub-components card: exports shown inside their parent's card rather than given a
 * card of their own. The hand-off lists 28; `NotificationBadge` and `CheckboxIndicator`
 * are not exports of the kit (Avatar and Badge carry the notification count, Checkbox
 * draws its own indicator), so they are left out and the count is the list's own.
 */
export const SUB_COMPONENTS: readonly SubComponentGroup[] = [
  { parent: "Card", href: "/components/card", names: ["CardHeader", "CardTitle", "CardDescription", "CardContent", "CardFooter", "CardSeparator", "CardMedia"] },
  { parent: "Avatar · Badge", href: "/components/avatar", names: ["AvatarGroup", "AvatarMenu", "BadgeGroup"] },
  { parent: "Checkbox · Radio", href: "/components/radio", names: ["RadioGroup"] },
  { parent: "Chat", href: "/components/chat", names: ["ChatThread", "ChatMessage", "ChatComposer", "Markdown"] },
  { parent: "Form", href: "/components/form", names: ["FormSection"] },
  { parent: "Drag & drop", href: "/components/drag-drop", names: ["DragDropProvider", "DropZone", "Draggable", "DragHandle"] },
  { parent: "AppFrame", href: "/components/app-frame", names: ["Page"] },
  { parent: "Toast", href: "/components/toast", names: ["ToastProvider", "useToast"] },
  { parent: "Grid · Reveal · Breadcrumb", href: "/components/grid", names: ["GridItem", "RevealGroup", "BreadcrumbItem"] },
];

export const SUB_COMPONENTS_HEADING = "Sub-components · shown inside their parent's card";

/** How many exports the sub-components card lists. */
export const SUB_COMPONENT_COUNT = SUB_COMPONENTS.reduce((sum, group) => sum + group.names.length, 0);

/** The templates call to action; the count is the templates registry's, passed in by the page. */
export const TEMPLATES_CALL = {
  title: (count: number) => `${count} page templates`,
  body: PLATFORM_COPY.templatesBody,
  label: "Open templates",
  href: TEMPLATES_PAGE.href,
} as const;
