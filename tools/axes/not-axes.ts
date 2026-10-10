// The resolvers tools/axes/resolver-sites.ts finds that choose between something other
// than a component's semantic props, keyed `file#name`, with the reason each one is not
// an axis. The characterization (test/axes.test.ts) needs every other site in its
// registry, and the design rule for components on axis tables
// (test/design-rules-source.test.ts) lets these stand in a migrated component.
export const NOT_AXES: Readonly<Record<string, string>> = {
  "src/atoms/textarea/textarea.styles.ts#field": "The field skin's border by state (an error over focus), not a choice between props.",
  "src/organisms/calendar/calendar.shared.tsx#dayCell": "A day's place in the selected range, computed from dates.",
  "src/organisms/calendar/calendar.styles.ts#dayCellState": "A day cell's fill by state (selected over today).",
  "src/organisms/calendar/calendar.styles.ts#dayLabel": "A day label's ink by state (selected over today).",
  "src/organisms/row-menu/row-menu.styles.ts#rowTextColor": "One item's `destructive` toggle, painted by the skin: there is nothing for it to win over.",
  "src/molecules/code-block/tokenize.ts#<anonymous>": "The tokenizer's context, not props.",
  "src/style/glass-surface/material-resolution.ts#resolveMaterial": "The material's accessibility ladder (Increase Contrast, Reduce Transparency, the surface preference).",
};
