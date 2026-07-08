import { View, Text, useTheme, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
import { Badge } from "../../atoms/badge/badge.js";
import { Button } from "../../atoms/button/button.js";
import * as s from "./description-lists.styles.js";
import { type Layout } from "./description-lists.styles.js";

// Shared DescriptionList shell. The structure (term/value rows in stacked,
// two-column, or inline layouts, an optional card surface with a header band),
// the boolean-prop axes and their precedence, the data-shape types, and the
// semantic value affordances (badge / status / mono / update) all live here once;
// a platform file supplies only its skin (card shape, density, type tracking,
// elevation) and calls createDescriptionList.
//
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
//
// DescriptionList is a "Light" platform treatment: one structure and one set of
// (semantic) colors, with per-OS touches limited to the card corner radius, row
// density/spacing, type tracking, and the surface elevation (iOS/web cast a soft
// shadow; Material 3 keeps the outlined surface flat). The skin carries only
// those pieces; the colors and structure are shared here. The list has no
// pressable rows of its own (the only interactive affordance is the already-
// skinned Button link), so no per-OS press feedback is needed at this level.

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
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

// The per-OS-varying style pieces. Everything else (structure, semantic colors,
// hairline rules, layout axes) is shared. Web keeps the current Canvas look;
// iOS uses SF/HIG conventions; Android uses Material 3.
export interface DescriptionListSkin {
  /** Card surface corner radius (web 8, iOS 12 inset-grouped, M3 12). */
  cardRadius: number;
  /** Card surface elevation: a soft shadow on iOS/web, flat on Material 3. */
  cardShadow: ViewStyle;
  /** Vertical gap between rows (and the rows-under-header group). */
  rowGap: number;
  /** Self-padding of a card with no header band. */
  cardPadding: number;
  /** Per-OS type tracking for the muted term label (inline / two-column). */
  termTracking: TextStyle;
  /** Per-OS type tracking for the small uppercase stacked term label. */
  stackedTermTracking: TextStyle;
  /** Per-OS type tracking for the full-weight value label. */
  valueTracking: TextStyle;
  /** Per-OS type tracking for the card header title. */
  headerTitleTracking: TextStyle;
}

// Layout precedence when more than one is passed: first match wins.
// `stacked` is the lowest-precedence opt-in and the default when no layout
// boolean is set, so reading it here makes the public prop a real, intentional
// choice rather than relying on it only as the unconditional fallback.
function layoutOf(p: DescriptionListProps): Layout {
  if (p.inline) return "inline";
  if (p.twoColumn) return "twoColumn";
  if (p.stacked) return "stacked";
  return "stacked";
}

// Render a value cell: a badge family, a monospace token, or plain text.
function Value({ item, align, skin }: { item: DescriptionListItem; align?: boolean; skin: DescriptionListSkin }) {
  const { tokens } = useTheme();
  if (item.status) return <Badge status success>{item.value}</Badge>;
  if (item.badge) return <Badge secondary>{item.value}</Badge>;
  if (item.mono) {
    return <Text style={[s.valueLabel(tokens), skin.valueTracking, s.valueMono]}>{item.value}</Text>;
  }
  return <Text style={[s.valueLabel(tokens), skin.valueTracking, align ? s.valueAlignRight : null]}>{item.value}</Text>;
}

export function createDescriptionList(skin: DescriptionListSkin) {
  return function DescriptionList(props: DescriptionListProps) {
    const { items, title, subtitle, divided, card, testID, style } = props;
    const { tokens } = useTheme();
    const layout = layoutOf(props);
    const hasHeader = card && !!title;

    const container: StyleProp<ViewStyle> = [
      card ? s.cardSurface(tokens, skin) : null,
      // No global padding when a header band supplies its own px-6 per section.
      card && !hasHeader ? { padding: skin.cardPadding } : null,
      !hasHeader ? { gap: skin.rowGap } : null,
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
          <Text
            style={[
              layout === "stacked" ? [s.termStacked(tokens), skin.stackedTermTracking] : [s.termLabel(tokens), skin.termTracking],
              layout === "twoColumn" ? s.termColumn : null,
            ]}
          >
            {item.term}
          </Text>
          <View style={layout === "twoColumn" ? s.twoColumnValueCell : null}>
            <Value item={item} align={layout === "inline"} skin={skin} />
            {item.update ? (
              <Button link small accessibilityLabel={`Update ${item.term}`}>
                Update
              </Button>
            ) : null}
          </View>
        </View>
      );
    });

    return (
      <View testID={testID} style={container}>
        {hasHeader ? (
          <View style={s.headerBand(tokens)}>
            <Text style={[s.headerTitle(tokens), skin.headerTitleTracking]}>{title}</Text>
            {subtitle ? <Text style={s.headerSubtitle(tokens)}>{subtitle}</Text> : null}
          </View>
        ) : null}
        {hasHeader ? <View style={s.rowsWrap(skin)}>{rows}</View> : rows}
      </View>
    );
  };
}
