import { PLATFORM_COPY } from "../data/platform-copy";
// The Data section page's sample data (`Canvas v4.0.0 Data.dc.html`, its script's PEOPLE,
// ACC, CODE, CAL_EV and CHAT0 tables), as the kit's own item shapes. Plain data (React only
// for a type); docs/src/sections/data.tsx renders it.

import type { ComponentProps } from "react";
import type { BoardColumn, BoardItem, Calendar, ChatMessageData, CodeBlockTab } from "@nannier/canvas";

/** A Calendar event (the kit exports the component, not this item type). */
type CalendarEvent = NonNullable<ComponentProps<typeof Calendar>["events"]>[number];

/** A member row of the DataTable card (the hand-off's PEOPLE). */
export interface Member {
  name: string;
  email: string;
  photo: string;
  team: string;
  status: "Active" | "Invited" | "Suspended";
  balance: string;
  activity: number[];
}

export const MEMBERS: readonly Member[] = [
  { name: "Ada Lovelace", email: "ada@ionize.io", photo: "/ada-lovelace.jpg", team: "Platform", status: "Active", balance: "12,480.00", activity: [40, 55, 45, 70, 62, 80, 74, 92] },
  { name: "Grace Hopper", email: "grace@ionize.io", photo: "/grace-hopper.jpg", team: "Compilers", status: "Active", balance: "9,120.50", activity: [30, 34, 52, 48, 66, 70, 84, 90] },
  { name: "Kira Tanaka", email: "kira@ionize.io", photo: "/kira-tanaka.jpg", team: "Design", status: "Invited", balance: "4,300.00", activity: [50, 52, 50, 55, 53, 58, 56, 60] },
  { name: "Noor Park", email: "noor@ionize.io", photo: "/noor-park.jpg", team: "Mobile", status: "Active", balance: "7,845.25", activity: [70, 62, 66, 50, 54, 42, 46, 38] },
  { name: "Marcus Allen", email: "marcus@ionize.io", photo: "/marcus-allen.jpg", team: "Growth", status: "Suspended", balance: "0.00", activity: [60, 58, 40, 42, 30, 28, 20, 18] },
  { name: "Liang Bao", email: "liang@ionize.io", photo: "/liang-bao.jpg", team: "Data", status: "Active", balance: "15,002.00", activity: [20, 30, 45, 60, 66, 75, 80, 95] },
];

/** The rows the reference image shows selected (Grace Hopper and Noor Park). */
export const SELECTED_MEMBERS = [1, 3] as const;

/** The Accordion card's questions (the hand-off's ACC). */
export const QUESTIONS = [
  { key: "glass", title: "Is glass a component prop?", body: "No. Glass is a theming mode: <ThemeProvider glass>. Each surface then takes its own tint layer, from sheer shells to dense menus." },
  { key: "variant", title: "Can I pass variant=\"primary\"?", body: "String enums are not part of the API. Pass the boolean that names the meaning: <Button primary>." },
  { key: "rebrand", title: "How do I rebrand?", body: "Set one hue. --ion is oklch(L C var(--hue)), so every fill, ring and glow moves together and stays in gamut." },
] as const;

/** The CodeBlock card's two tabs (the hand-off's CODE). */
export const CODE_TABS: CodeBlockTab[] = [
  {
    label: "Save.tsx",
    filename: "Save.tsx",
    language: "tsx",
    code: [
      "import { ThemeProvider, Button } from \"@nannier/canvas\";",
      "",
      "export function Save() {",
      "  return (",
      "    <ThemeProvider dark glass>",
      "      <Button primary large>Save</Button>",
      "    </ThemeProvider>",
      "  );",
      "}",
    ].join("\n"),
  },
  {
    label: "tokens.css",
    filename: "tokens.css",
    language: "css",
    code: [
      "[data-ion] {",
      "  --hue: 285;",
      "  --ion: oklch(.74 .17 var(--hue));",
      "  --ion-soft: oklch(.74 .17 var(--hue) / .16);",
      "  --ion-ring: oklch(.74 .17 var(--hue) / .35);",
      "}",
    ].join("\n"),
  },
];

/** October 2026's events (the hand-off's CAL_EV); hours are decimal (13.5 = 13:30). */
export const CALENDAR_EVENTS: CalendarEvent[] = [
  { day: 5, title: "Sprint planning", start: 10, end: 11 },
  { day: 12, title: "Token review", start: 14, end: 14.75 },
  { day: 12, title: "Design crit", start: 16.5, end: 17 },
  { day: 14, title: "Release v6.2" },
  { day: 21, title: "Accessibility audit", start: 9.5, end: 11.5 },
  { day: 26, title: "Design review", start: 10, end: 11 },
  { day: 26, title: "Token sync", start: 13.5, end: 14.25 },
  { day: 26, title: "Release v6.3" },
  { day: 28, title: `${PLATFORM_COPY.samplePlatform} blur rebuild`, start: 15, end: 16 },
  { day: 30, title: "Quarterly planning", start: 12, end: 15 },
];

/** The Chat card's opening thread (the hand-off's CHAT0). */
export const CHAT_THREAD: ChatMessageData[] = [
  { id: 1, role: "assistant", provider: "Claude", content: "Hi. Ask how any Canvas component sizes itself, or which props it takes." },
  { id: 2, role: "user", content: "Does Card take a style prop?" },
  { id: 3, role: "assistant", provider: "Claude", content: "No. There is no style escape hatch. Use the semantic booleans: `<Card raised selected>`." },
];

/** The canned replies the Chat card answers with, in turn. */
export const CHAT_REPLIES = [
  "Every component takes its width from its parent: a Container step, a Row span or a Grid cell.",
  "Glass is a ThemeProvider mode, so one switch moves every surface to its own tint layer.",
] as const;

/** The Board card's columns and cards (the hand-off's c-board). */
export const BOARD_COLUMNS: BoardColumn[] = [
  { id: "backlog", label: "Backlog", badge: "3" },
  { id: "progress", label: "In progress", badge: "2" },
  { id: "review", label: "Review", badge: "1" },
];

export const BOARD_ITEMS: BoardItem[] = [
  { id: "timeline", columnId: "backlog", title: "Calendar week timeline", description: "Timed blocks on the hour grid, glass under the now-line.", badge: "organism" },
  { id: "geo", columnId: "backlog", title: "GeoMap zoom clusters", badge: "P2" },
  { id: "tooltip", columnId: "backlog", title: "Tooltip on glass", description: "Lifted 3°, ion ring, lg shadow.", badge: "atom" },
  { id: "overlays", columnId: "progress", title: "Overlays on glass-tint-dense", description: "Dialog, sheet, popover, toast and the command palette move to the densest tint.", badge: "#482" },
  { id: "series", columnId: "progress", title: "Chart series palette" },
  { id: "switch", columnId: "review", title: "Switch thumb spring", badge: "ready" },
];
