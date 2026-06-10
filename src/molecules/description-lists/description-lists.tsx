import { View, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Badge } from "../../atoms/badge/badge.js";
import { Button } from "../../atoms/button/button.js";
import * as s from "./description-lists.styles.js";
import { type Layout } from "./description-lists.styles.js";

// DescriptionList: term/value pairs for detail panels, settings, and profile
// views. Each item is a { term, value } pair. The term is the small muted
// label; the value is the full-weight data it describes, so the data always
// outranks its label.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf / Card's surfaceOf).
//
// - Layout (pick one; precedence inline > twoColumn > stacked):
//   `inline` lays the term on the left and the value on the right of a single
//   row; `twoColumn` puts the term in a fixed 160px label column with the value
//   beside it (the read-only detail look); the default `stacked` puts a small
//   uppercase muted label above a full-weight value.
// - Rows: `divided` draws a hairline (border-b border-border) under every row
//   but the last, for the two-column detail look.
// - Surface: `card` wraps the whole list in a card surface (border, radius,
//   padding) so it reads as a self-contained panel. `title`/`subtitle` add a
//   bordered header band to the card.
//
// Per-item value affordances (all optional, render the value richly):
// `badge` renders the value as a secondary metadata Badge; `status` renders it
// as a success status Badge with a leading dot (live state); `mono` sets a
// monospace face for tokens/IDs; `update` appends a trailing "Update" link
// button so an editable row is discoverable (the inline-edit affordance).
//
// Layout, rows, and surface are orthogonal axes and combine freely.

export interface DescriptionListItem {
  term: string;
  value: string;
  // Render the value as a secondary metadata badge (e.g. a role).
  badge?: boolean;
  // Render the value as a success status badge with a leading dot (live state).
  status?: boolean;
  // Monospace value face, for tokens, scopes, identifiers.
  mono?: boolean;
  // Append a trailing "Update" link affordance, marking the row editable.
  update?: boolean;
}

export interface DescriptionListProps {
  items: DescriptionListItem[];
  // Card header band (only shown when `card`): a title and optional subtitle.
  title?: string;
  subtitle?: string;
  // Layout (pick one; precedence inline > twoColumn > stacked).
  inline?: boolean;
  twoColumn?: boolean;
  stacked?: boolean;
  // Rows: hairline divider beneath every row but the last.
  divided?: boolean;
  // Surface: wrap the list in a card surface.
  card?: boolean;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

// Layout precedence when more than one is passed: first match wins.
function layoutOf(p: DescriptionListProps): Layout {
  if (p.inline) return "inline";
  if (p.twoColumn) return "twoColumn";
  return "stacked";
}

// Render a value cell: a badge family, a monospace token, or plain text.
function Value({ item, align }: { item: DescriptionListItem; align?: boolean }) {
  const { tokens } = useTheme();
  if (item.status) return <Badge status success>{item.value}</Badge>;
  if (item.badge) return <Badge secondary>{item.value}</Badge>;
  if (item.mono) {
    return <Text style={[s.valueLabel(tokens), s.valueMono]}>{item.value}</Text>;
  }
  return <Text style={[s.valueLabel(tokens), align ? s.valueAlignRight : null]}>{item.value}</Text>;
}

export function DescriptionList(props: DescriptionListProps) {
  const { items, title, subtitle, divided, card, style } = props;
  const { tokens } = useTheme();
  const layout = layoutOf(props);
  const hasHeader = card && !!title;

  const container: StyleProp<ViewStyle> = [
    card ? s.cardSurface(tokens) : null,
    // No global padding when a header band supplies its own px-6 per section.
    card && !hasHeader ? s.cardPad : null,
    !hasHeader ? s.stackGap : null,
    style,
  ];

  const rows = items.map((item, index) => {
    const last = index === items.length - 1;
    // A divided list draws a hairline under each row except the last, and pads
    // the row vertically so the rule sits clear of the text.
    const row: StyleProp<ViewStyle> = [
      s.rowLayout[layout],
      divided ? s.rowDividedPad : null,
      divided && !last ? s.rowDivider(tokens) : null,
    ];
    return (
      <View key={`${item.term}-${index}`} style={row}>
        <Text style={[layout === "stacked" ? s.termStacked(tokens) : s.termLabel(tokens), layout === "twoColumn" ? s.termColumn : null]}>
          {item.term}
        </Text>
        <View style={layout === "twoColumn" ? s.twoColumnValueCell : null}>
          <Value item={item} align={layout === "inline"} />
          {item.update ? (
            <Button link small>
              Update
            </Button>
          ) : null}
        </View>
      </View>
    );
  });

  return (
    <View style={container}>
      {hasHeader ? (
        <View style={s.headerBand(tokens)}>
          <Text style={s.headerTitle(tokens)}>{title}</Text>
          {subtitle ? <Text style={s.headerSubtitle(tokens)}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {hasHeader ? <View style={s.rowsWrap}>{rows}</View> : rows}
    </View>
  );
}
