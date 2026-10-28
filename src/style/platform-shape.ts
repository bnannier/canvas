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
 *   step (8) on the tooltip bubble; a calendar event at 6 (the v4 hand-off's calendar
 *   timeline); and the chart marks of the v4
 *   hand-off's chart renderers: a bar (3), a compact bar or a box (4), a data cell (2), a
 *   heatmap cell (2.5), a candlestick's body (1.5), a treemap tile (8), a sparkline's
 *   track (6), a funnel stage's bar (6), a bar list's share wash (8) and a service
 *   row's strip bar (1). The kit's own web parts no Dark Factory role covers keep their
 *   corner as a role of their own: the v4 hand-off's table frame, stacked list and grid-list tile (14 each), the ghost a
 *   drag lifts (12), a conversation's composer well (16) and its user bubble (16),
 *   tailed at 4 on the bottom end toward its author (the v4 hand-off's chat), a standalone disclosure's card (14, the v4
 *   hand-off's collapsible), the code card (14, the hand-off's code block), a media frame (14, the hand-off's video frame and QR code quiet zone), the pager's cells (8, the v4
 *   hand-off's pagination renderer: its pages, arrows and rows-per-page trigger), a menu's
 *   row (8, the v4 hand-off's menu rows: Select's and Autocomplete's options, RowMenu's
 *   rows and its square trigger, the Dropdown's rows; iOS and Android run their menu rows
 *   full bleed), the command palette's panel (18) and its rows (9), the alert callout
 *   (14), the alert dialog (24) and the empty state (18), the v4 hand-off's renderers
 *   for each, the `rounded` avatar square (the hand-off's 28% of its disc: 6, 8, 11 and 16
 *   on the 20, 28, 40 and 56 discs), the emblem tile (the same 28%: 8, 11 and 16 on the
 *   28, 40 and 56 tiles, the v4 hand-off's Emblem renderer), the board's lane (14) and its card (10), the v4
 *   hand-off's board renderer, and the sidebar's (the v4 hand-off's rail: a nav row at 9, 8 in the compact docs rail, the
 *   bordered rail card at 12 and the floating one at 14).
 * - iOS rounds the action sheet at 34 (the iOS 27 kit's Action Sheets symbol), an inset
 *   grouped list or well at 26, a calendar event at 6, the search field's well at 10
 *   (the v4 hand-off's iOS search field), a grouped rail's row at 10 (the hand-off's
 *   iOS vertical tabs), and the UIAlertController alert at 14 (the hand-off's iOS alert
 *   dialog).
 * - Android draws each Material 3 component at the step of the M3 scale its spec names: a
 *   chip, an event chip and the slider track at small, a plain tooltip and a snackbar at
 *   extra-small, the navigation drawer at large, a carousel item at
 *   extra-large. The tab indicator rounds its top corners at its own 3dp height, and the
 *   slider's track segments round their edge at the handle gap at 2dp. The kit's own
 *   Android parts take a step of the same scale.
 *
 * Kit-internal: the package does not export it. Promoting a role to `shape` is a change to
 * the public table.
 */
export const platformShape = {
  web: { insetRow: 10, disclosureCard: 14, codeCard: 14, mediaFrame: 14, brandMark: 9, avatarSquareTiny: 6, avatarSquareSmall: 8, avatarSquare: 11, avatarSquareLarge: 16, emblemSmall: 8, emblem: 11, emblemLarge: 16, referenceCard: 14, referenceSource: 6, pageCell: 8, menuRow: 8, commandPanel: 18, commandRow: 9, callout: 14, alertDialog: 24, emptyState: 18, key: 6, tooltip: 8, event: 6, bar: 3, mark: 4, cell: 2, candle: 1.5, chartTile: 8, heatCell: 2.5, sparkTrack: 6, funnelBar: 6, listBar: 8, stripBar: 1, tableFrame: 14, listFrame: 14, gridTile: 14, dragGhost: 12, composer: 16, bubble: 16, bubbleTail: 4, navRow: 9, navRowCompact: 8, rail: 12, floatingRail: 14, navBar: 14, lane: 14, laneCard: 10 },
  ios: { actionSheet: 34, groupedList: 26, event: 6, searchField: 10, navRow: 10, alertDialog: 14 },
  android: {
    chip: M3.small,
    event: M3.small,
    sliderTrack: M3.small,
    tooltip: M3.extraSmall,
    snackbar: M3.extraSmall,
    navigationDrawer: M3.large,
    carouselItem: M3.extraLarge,
    tabIndicator: 3,
    sliderTrackInner: 2,
  },
} as const satisfies Record<PlatformKey, Record<string, number>>;
