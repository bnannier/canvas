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
 *   button set in a pane, a heatmap's value flag, a text trigger's press layer); the
 *   compact keycaps of the v4 hand-off's section pages at 5 (the 22 px cap, `small`: the
 *   Inputs search field's and the Overlays command palette's "⌘K" and "esc") and 4 (the
 *   20 px cap, `tiny`: the Navigation search field's "⌘K"); the prose
 *   code chip at 5 (the v4 hand-off's inline `<code>` from its Markdown helper, Component.dc.html
 *   `md()`, `border-radius:5px`, a word of code inside a sentence); its `chip`
 *   step (8) on the tooltip bubble; a calendar event at 6 (the v4 hand-off's calendar
 *   timeline); and the chart marks of the v4
 *   hand-off's chart renderers: a bar (3), a compact bar or a box (4), a data cell (2), a
 *   heatmap cell (2.5), a candlestick's body (1.5), a treemap tile (8), a sparkline's
 *   track (6), a funnel stage's bar (6), a bar list's share wash (8), a service
 *   row's strip bar (1), a sparkline's or a metric spark strip's bar (2, the section
 *   cards' and MetricBreakdown's `rx="2"`) and the chart value flag (8, the ink pill the
 *   v4 hand-off's chart cards pin beside an inspected datum, `border-radius:7px` to `9px`)
 *   and a map's zoom control (8, the renderer's framed zoom column). The kit's own web parts no Dark Factory role covers keep their
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
 *   28, 40 and 56 tiles, the v4 hand-off's Emblem renderer) and its soft dialog tone tile (12, the
 *   hand-off's AlertDialog renderer), the 24 px dismiss box of an alert and a toast (6, the
 *   hand-off's `border-radius:6px` close), the announcement bar (12, the Overlays page's
 *   accent bar), the board's lane (14) and its card (10), the v4
 *   hand-off's board renderer, the sidebar's (the v4 hand-off's rail: a nav row at 9, 8 in the compact docs rail, the
 *   bordered rail card at 12 and the floating one at 14), and the two Card corner steps
 *   the hand-off's component page draws above the card: the section panel (18, its
 *   variants, props, accessibility, platform-skin and guidance cards, Component.dc.html
 *   lines 182, 233, 256 and 285) and the stage (20, its playground frame, anatomy stage
 *   and legend, lines 155, 217 and 221), the page's Copy button (8, the 28 px
 *   hairline button in the playground's JSX card bar, line 172, which the CodeBlock
 *   `playground` density draws), a card's snippet (10, the code block inside the
 *   page's guidance and variant cards, lines 187 and 288, which the CodeBlock `guide`
 *   density draws), and the two Card corner steps the hand-off's section pages draw
 *   above the card: the showcase card (20, every `c-*` card of `Canvas v4.0.0
 *   <Section>.dc.html`, `border-radius:20px`) and the hero stage (24, canvas-hero.js, the
 *   stage `.st` at `border-radius:24px`), which Card draws as `showcaseCorners` and
 *   `heroCorners`; and the Foundations page's samples: a colour bar (7, its neutral
 *   swatches and the series bar's outer ends), a series step (3, the series bar's inner
 *   corners), the accent ramp's clipped bar (10) and an icon's cell (10, its glyph grid).
 *   The authored Charts room additionally draws a bullet track (6), selected bar (6),
 *   dense/compact value flags (9/7), map frame/zoom panel (14/10), activity cells (3),
 *   service list frame (14), capacity strip ends/inner joins (7/3, compact 4/2),
 *   small treemap partitions (6/5/4), and a one-unit candlestick body. These are
 *   measured from Canvas v4.0.0 Charts.dc.html, not replacements for generic kit marks.
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
  web: { chartTrack: 6, chartSelectedBar: 6, chartFlagDense: 9, chartFlagCompact: 7, mapFrame: 14, mapZoom: 10, activityCell: 3, serviceFrame: 14, stackEnd: 7, stackInner: 3, stackEndCompact: 4, stackInnerCompact: 2, treemapSmall: 6, treemapTiny: 5, treemapSmallest: 4, candleShowcase: 1, boardMetadata: 6, insetRow: 10, disclosureCard: 14, codeCard: 14, mediaFrame: 14, brandMark: 9, avatarSquareTiny: 6, avatarSquareSmall: 8, avatarSquare: 11, avatarSquareLarge: 16, emblemSmall: 8, emblem: 11, emblemLarge: 16, emblemSoft: 12, dismiss: 6, announcement: 12, referenceCard: 14, referenceSource: 6, pageCell: 8, menuRow: 8, commandPanel: 18, commandRow: 9, callout: 14, alertDialog: 24, emptyState: 18, key: 6, keySmall: 5, keyTiny: 4, inlineCode: 5, optionChip: 7, optionTile: 8, tooltip: 8, event: 6, bar: 3, mark: 4, cell: 2, candle: 1.5, chartTile: 8, heatCell: 2.5, sparkTrack: 6, funnelBar: 6, listBar: 8, stripBar: 1, sparkBar: 2, chartFlag: 8, zoomControl: 8, tableFrame: 14, listFrame: 14, gridTile: 14, dragGhost: 12, composer: 16, bubble: 16, bubbleTail: 4, navRow: 9, navRowCompact: 8, rail: 12, floatingRail: 14, navBar: 14, lane: 14, laneCard: 10, panel: 18, stage: 20, copyButton: 8, cardSnippet: 10, showcaseCard: 20, heroStage: 24, swatchBar: 7, swatchStep: 3, rampBar: 10, iconCell: 10, stepMark: 10 },
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
