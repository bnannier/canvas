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

export const READING_FLOOR = { body: 12, lead: 12, small: 11, tiny: 10, caption: 10 } as const;

export type ReadingRole = keyof typeof READING_FLOOR;

export const TEXT_ROLES: Record<string, Record<string, ReadingRole>> = {
  // Dark Factory's sub-12 styles, by the Typography role each one serves.
  "src/style/type-scale.ts": {
    "typeScale.small": "small",
    "typeScale.caption": "tiny",
    "typeScale.micro": "tiny",
    "typeScale.tag": "caption",
    "typeScale.eyebrow": "caption",
    "typeScale.eyebrowLg": "caption",
    "typeScale.stageLabel": "caption",
  },
  "src/atoms/typography/typography.styles.ts": {
    "roleType.small": "small",
    "roleType.muted": "small",
    "roleType.code": "small",
    "roleType.tiny": "tiny",
    "roleType.caption": "caption",
  },
  "src/style/menu-look.ts": {
    menuSection: "caption",
    menuDetail: "tiny",
  },

  // Control labels at the small size, and the description lines under them.
  "src/atoms/button/button.styles.ts": { "WEB_TYPE.small": "small" },
  "src/atoms/button-group/button-group.styles.ts": { WEB_SEGMENT_TYPE: "small", WEB_CELL_TYPE: "small" },
  "src/atoms/pagination/pagination.styles.ts": { labelSize: "small" },
  "src/atoms/listbox/listbox.styles.ts": { LABEL_TYPE: "small", detail: "tiny" },
  "src/atoms/checkbox/checkbox.styles.ts": { DESCRIPTION_TYPE: "small" },
  "src/atoms/radio/radio.styles.ts": { DESCRIPTION_TYPE: "small" },
  "src/atoms/slider/slider.styles.ts": { DESCRIPTION_TYPE: "small" },
  "src/atoms/switch/switch.shared.tsx": { DESC_FONT: "small" },
  "src/atoms/progress/progress.styles.ts": { dfDescription: "small" },
  "src/atoms/dropdown/dropdown.styles.ts": { "webSkin.menuHeaderDescription": "small" },
  "src/organisms/toast/toast.styles.ts": { "webSkin.description": "small" },
  "src/molecules/media-objects/media-objects.styles.ts": {
    "webSkin.compact.description": "small",
    "iosSkin.compact.description": "small",
    "androidSkin.compact.description": "small",
  },
  "src/organisms/data-table/data-table.styles.ts": { "webSkin.stackedLabel": "small", "iosSkin.stackedLabel": "small" },

  // Pills, tags, badges, meta lines and annotations.
  "src/atoms/badge/badge.styles.ts": { "webSkin.labelType": "tiny" },
  "src/atoms/chip/chip.styles.ts": { "webSkin.labelType": "tiny" },
  "src/atoms/avatar/avatar.styles.ts": { LABEL: "caption", "webMenuSkin.menuPillSecondary": "tiny" },
  "src/molecules/code-block/code-block.styles.ts": { headerBadge: "tiny" },
  "src/molecules/stacked-lists/stacked-lists.styles.ts": { "androidSkin.metaLabel": "tiny" },
  "src/charts/funnel-chart/funnel-chart.shared.tsx": { STAGE_DETAIL_TYPE: "tiny" },
  "src/charts/metric-breakdown/metric-breakdown.shared.tsx": { captionStyle: "tiny", SPARK_TAG_TYPE: "tiny" },
  "src/charts/shared/breakdown-rows.tsx": { SHARE_TYPE: "tiny", DELTA_TYPE: "tiny" },
  "src/charts/treemap/treemap.shared.tsx": { TILE_VALUE_TYPE: "tiny" },

  // Eyebrows, axis and hour labels, tab-bar labels, keycaps.
  "src/atoms/divider/divider.styles.ts": { "webSkin.labelType": "caption" },
  "src/atoms/kbd/kbd.styles.ts": { LABEL_TYPE: "caption" },
  "src/charts/heatmap/heatmap.shared.tsx": { CAL_MONTH_TYPE: "caption", CAL_WEEKDAY_TYPE: "caption", FLAG_DETAIL_TYPE: "tiny" },
  "src/charts/radar-chart/radar-chart.shared.tsx": { AXIS_LABEL_TYPE: "caption" },
  "src/charts/uptime-bar/uptime-bar.shared.tsx": { EDGE_CAPTION_TYPE: "caption" },
  "src/organisms/calendar/calendar.styles.ts": {
    "webSkin.hourLabel": "caption",
    "webSkin.eventTime": "caption",
    "iosSkin.hourLabel": "caption",
    "iosSkin.eventTime": "caption",
    "androidSkin.hourLabel": "caption",
    "androidSkin.eventTime": "caption",
  },
  "src/organisms/tab-bar/tab-bar.styles.ts": { "iosSkin.label": "caption", "webSkin.label": "caption" },
};
