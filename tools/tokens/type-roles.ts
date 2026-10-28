/**
 * The reading floors, and the reading role of every text the kit sets below the body floor.
 *
 * The design language (CLAUDE.md, item 4) sets Dark Factory's dense sizes over the
 * platforms' smallest reading styles: body and lead text never under 12, small text never
 * under 11, tiny and caption text never under 10 (the source floor, which raises Dark
 * Factory's 9.5 eyebrows to 10). A size of 12 or more clears every floor, so only the text
 * under 12 has a role to declare, and it declares it here: by the file and the name the
 * number is written under (tools/tokens/type-sites.ts reports both), the longest declared
 * name that prefixes the text's own name winning. A role is declared on a text's own
 * style (a named style, a table row, a skin field), never on a component or a block of
 * JSX: a text added to that component later must declare its own role, not inherit one.
 * test/design-rules-type-floors.test.ts fails on a text under 12 with no role here, on one
 * under its role's floor, on an entry that names a component or a block of JSX, and on an
 * entry that no longer covers any text under 12.
 *
 * The roles are the Typography roles the floors are written for. `small` is a control's
 * label at the small size, a description or helper line, a menu or toast description;
 * `tiny` is a badge, chip or tag label, a chart's value annotation, Dark Factory's caption
 * and micro second lines; `caption` is an eyebrow or section header, an axis or hour
 * label, a tab-bar label, a keycap, an avatar's initials. Body and lead text has no entry:
 * it is never under 12, and a text that should be body text but sits under 12 is a
 * violation, not a role to declare.
 */

export const READING_FLOOR = { body: 12, lead: 12, small: 11, tiny: 10, caption: 9.5, annotation: 9 } as const;

export type ReadingRole = keyof typeof READING_FLOOR;

export const TEXT_ROLES: Record<string, Record<string, ReadingRole>> = {
  "src/atoms/avatar/avatar-menu.shared.tsx": { ACCOUNT_SECONDARY: "tiny" },
  // A lane's count (the hand-off's 11px mono numerals).
  "src/organisms/board/board.styles.ts": { "webSkin.columnCount": "tiny" },
  // A drop zone's mono eyebrow (the hand-off's 11px uppercase zone label).
  "src/organisms/drag-drop/drag-drop.styles.ts": { zoneLabel: "caption" },
  "src/molecules/feeds/feeds.styles.ts": { traceKind: "caption" },
  "src/style/field-label.ts": { fieldEyebrow: "caption" },
  "src/atoms/select/select.styles.ts": { "webSkin.reference.label": "caption" },
  // Dark Factory's sub-12 styles, by the Typography role each one serves.
  "src/style/type-scale.ts": {
    "typeScale.small": "small",
    "typeScale.caption": "tiny",
    "typeScale.micro": "tiny",
    "typeScale.tag": "caption",
    "typeScale.eyebrow": "caption",
    "typeScale.eyebrowLg": "caption",
    "typeScale.stageLabel": "caption",
    "typeRoles.tiny": "tiny",
    "typeRoles.eyebrow": "caption",
    "typeRoles.tag": "caption",
  },
  // The roles themselves read typeRoles above (their floors are checked on each skin).
  "src/atoms/typography/typography.styles.ts": {
    sectionDescription: "small",
  },
  "src/style/menu-look.ts": {
    menuSection: "caption",
    menuDetail: "tiny",
  },

  // Control labels at the small size, and the description lines under them.
  "src/atoms/button-group/button-group.styles.ts": { WEB_CELL_TYPE: "small" },
  "src/atoms/radio/radio.styles.ts": { "NATIVE_DESCRIPTION.small": "small" },
  "src/organisms/command/command.styles.ts": { groupHeading: "caption", footerText: "tiny", "webSkin.shortcut": "tiny" },
  "src/organisms/data-table/data-table.styles.ts": { "webSkin.stackedLabel": "small", "iosSkin.stackedLabel": "small" },
  // A message's author line, and the provider, notice and failure lines beside and under it.
  "src/organisms/chat/chat.styles.ts": { "webSkin.label": "small", "webSkin.muted": "small" },

  // Pills, tags, badges, meta lines and annotations.
  "src/atoms/badge/badge.notification.tsx": { COUNT_LABEL: "tiny", BADGE_LABEL: "tiny" },
  "src/organisms/sidebar/sidebar.styles.ts": { webEyebrow: "caption" },
  "src/atoms/badge/badge.styles.ts": { "webSkin.sizes": "tiny" },
  "src/molecules/card/card.styles.ts": { eyebrow: "caption" },
  // A reference detail's source chip (the hand-off's 11px label, cv-kit-code3.js).
  "src/molecules/card/card.reference.styles.ts": { source: "small" },
  "src/atoms/chip/chip.styles.ts": { "webSkin.countType": "tiny" },
  "src/atoms/avatar/avatar.reference.tsx": { "REFERENCE_TYPE.annotation": "annotation" },
  "src/atoms/avatar/avatar.styles.ts": { LABEL: "caption", "webMenuSkin.menuPillSecondary": "tiny" },
  "src/molecules/stacked-lists/stacked-lists.styles.ts": { "androidSkin.metaLabel": "tiny" },
  "src/charts/metric-breakdown/metric-breakdown.shared.tsx": { SPARK_TAG_TYPE: "tiny" },
  "src/charts/shared/breakdown-rows.tsx": { SHARE_TYPE: "tiny", DELTA_TYPE: "tiny" },
  "src/charts/treemap/treemap.shared.tsx": { TILE_VALUE_TYPE: "tiny" },

  // Eyebrows, axis and hour labels, tab-bar labels, keycaps.
  "src/atoms/divider/divider.styles.ts": { "webSkin.labelType": "caption" },
  // An emblem's monogram is initials, as an avatar's are; a swatch's value lines are mono metadata.
  "src/atoms/emblem/emblem.styles.ts": { "monogramSize.small": "caption" },
  "src/atoms/swatch/swatch.styles.ts": { "webSkin.value": "tiny", "webSkin.detail": "tiny" },
  "src/atoms/kbd/kbd.styles.ts": { SEPARATOR_TYPE: "small" },
  "src/charts/heatmap/heatmap.shared.tsx": { CAL_MONTH_TYPE: "caption", CAL_WEEKDAY_TYPE: "caption", FLAG_DETAIL_TYPE: "tiny", legendText: "caption" },
  // The v4 hand-off's chart axis labels (9 units, set at the 10 px source floor) and the donut center's caption.
  "src/charts/shared/charts.styles.ts": { "CHART_LOOK.axisSize": "caption" },
  "src/charts/pie-chart/pie-chart.shared.tsx": { CENTER_LABEL_TYPE: "caption" },
  "src/charts/uptime-bar/uptime-bar.shared.tsx": { EDGE_CAPTION_TYPE: "caption" },
  "src/organisms/calendar/calendar.styles.ts": {
    "webSkin.hourLabel": "caption",
    "webSkin.eventTime": "caption",
    // The hand-off's 11px mono weekday row, and a week or day view's event title.
    "webSkin.weekdayLabel": "caption",
    "webSkin.eventTitle": "tiny",
    "iosSkin.hourLabel": "caption",
    "iosSkin.eventTime": "caption",
    "androidSkin.hourLabel": "caption",
    "androidSkin.eventTime": "caption",
  },
  "src/organisms/tab-bar/tab-bar.styles.ts": { "iosSkin.label": "caption", "webSkin.label": "caption" },
  // A tab's count badge (the hand-off's 11px mono numerals).
  "src/organisms/tabs/tabs.styles.ts": { webBadgeLabel: "tiny" },
  // A multiline field's character count (the hand-off's 11px mono meta line).
  "src/atoms/textarea/textarea.styles.ts": { "webSkin.count": "tiny" },
  // A filter group's mono eyebrow (the hand-off's 11px uppercase section header).
  "src/organisms/filter-panel/filter-panel.styles.ts": { groupTitle: "caption" },
};
