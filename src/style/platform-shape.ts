import type { PlatformKey } from "./tokens.js";

/** Material 3's corner radius scale (m3.material.io/styles/shape/corner-radius-scale), by its own names. */
const M3 = { extraSmall: 4, small: 8, medium: 12, large: 16, extraLarge: 28 } as const;

/**
 * Each platform's own roles: the corner a platform draws for an element whose role only
 * that platform has (an iOS action sheet, a Material 3 snackbar) or only the kit draws (a
 * keycap, a chart's bar), keyed by the role the element plays.
 *
 * `shape` (tokens.ts) holds the roles every platform draws, and this table holds the rest
 * of each platform's row, so together they are the whole row a skin reads its corners
 * from: a skin reads its own platform's row for the role each element plays, and a corner
 * that plays no role is square (0), a pill (9999) or concentric with its container.
 * test/design-rules-shape.test.ts holds the kit to that, and tools/tokens/shape-roles.ts
 * lists the roles each component plays. Shared code draws the web look on every platform,
 * so it reads the web row; a native skin that draws Dark Factory's look for a part (no
 * platform control for it) shares the web skin's part instead of reading the web row.
 *
 * - The web is Dark Factory's: its `key` step (6) on a keycap, an inline code chip and the
 *   small inline boxes drawn like one (a compact icon box, a skeleton's text line, a copy
 *   button set in a pane, a heatmap's value flag, a text trigger's press layer); its `chip`
 *   step (8) on the tooltip bubble, a calendar event and a chart's bar; and the chart marks
 *   below a bar, a compact bar (4), a data cell (2, Dark Factory's meter segment) and a
 *   candlestick's body (1). The kit's own web parts no Dark Factory role covers keep their
 *   corner as a role of their own: a standalone table's header band (10) and the ghost a
 *   drag lifts (12).
 * - iOS rounds the action sheet at 34 (the iOS 27 kit's Action Sheets symbol), an inset
 *   grouped list or well at 26, and a calendar event at 6.
 * - Android draws each Material 3 component at the step of the M3 scale its spec names: a
 *   chip, an event chip and the slider track at small, a plain tooltip and a snackbar at
 *   extra-small, the navigation drawer and a side sheet at large, a carousel item at
 *   extra-large. The tab indicator rounds its top corners at its own 3dp height, and the
 *   slider's track segments round their edge at the handle gap at 2dp. The kit's own
 *   Android parts take a step of the same scale: a board lane at large, the separated code
 *   cells and a list's icon box at medium, the compact list row's icon box at small.
 *
 * Kit-internal: the package does not export it. Promoting a role to `shape` is a change to
 * the public table.
 */
export const platformShape = {
  web: { key: 6, tooltip: 8, event: 8, bar: 8, mark: 4, cell: 2, candle: 1, tableHeader: 10, dragGhost: 12 },
  ios: { actionSheet: 34, groupedList: 26, event: 6 },
  android: {
    chip: M3.small,
    event: M3.small,
    sliderTrack: M3.small,
    tooltip: M3.extraSmall,
    snackbar: M3.extraSmall,
    navigationDrawer: M3.large,
    sideSheet: M3.large,
    lane: M3.large,
    carouselItem: M3.extraLarge,
    codeCell: M3.medium,
    iconBox: M3.medium,
    compactIconBox: M3.small,
    tabIndicator: 3,
    sliderTrackInner: 2,
  },
} as const satisfies Record<PlatformKey, Record<string, number>>;
