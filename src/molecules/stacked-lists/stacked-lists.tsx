import { type ReactNode } from "react";
import { type GestureResponderEvent } from "react-native";
import { View, Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Avatar } from "../../atoms/avatar/avatar.js";
import { Badge } from "../../atoms/badge/badge.js";
import { Button } from "../../atoms/button/button.js";
import { Icon } from "../../atoms/icon/icon.js";
import * as s from "./stacked-lists.styles.js";

// A stacked list is a vertical list of rows separated by hairlines, each row a
// leading avatar, a primary + secondary text column, and trailing meta/badge/
// action. It is the building block for contact lists, activity feeds, and data
// previews.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf).
//
// - Variant axis (pick one; default is the plain two-line list): `clickable`
//   makes each row a pressable drilldown with a hover/press surface and a
//   trailing chevron; `card` wraps the list in a titled card surface with an
//   optional header. `clickable` wins over `card` when both are passed.
// - Divider (orthogonal boolean, on by default): draws a hairline between rows.
//   Pass `flush` to drop the dividers. The card variant always keeps its rows
//   ruled regardless of `flush`, matching the documented card surface group.

/** One row in the list. */
export interface StackedListItem {
  /** Primary line, bold (e.g. a person's name). */
  name: string;
  /** Secondary line, smaller and muted (e.g. an email or role). */
  detail: string;
  /** Trailing metadata text (e.g. "2h ago"). Ignored when `badge` is set. */
  meta?: string;
  /** Trailing badge label; rendered as a <Badge> instead of plain meta text. */
  badge?: string;
  /** Photo URL for the avatar; falls back to initials when absent. */
  avatar?: string;
  /** Initials shown when there is no photo; derived from `name` when omitted. */
  initials?: string;
}

export interface StackedListProps {
  /** Rows to render. */
  items?: StackedListItem[];
  /** Optional header title; shown above the rows, separated by a rule. */
  title?: ReactNode;
  /** Trailing header content (e.g. an action button); only shown with a title.
   *  Takes precedence over `addAction` when both are supplied. */
  action?: ReactNode;
  /** Convenience header action: renders a small outlined button with a leading
   *  plus icon and this label (e.g. "Add"). Only shown with a title and when
   *  `action` is not set. Serializable, so the playground can drive it. */
  addAction?: string;
  /** Appends a trailing ghost overflow ("...") action-menu button to every row.
   *  Press is reported through `onPressItemMenu`. */
  rowMenu?: boolean;
  /** Press handler for a row, by index. Only used in the `clickable` variant. */
  onPressItem?: (index: number, event: GestureResponderEvent) => void;
  /** Press handler for a row's overflow menu, by index. Used with `rowMenu`. */
  onPressItemMenu?: (index: number, event: GestureResponderEvent) => void;
  // Variant (pick one; default is the plain two-line list).
  clickable?: boolean;
  card?: boolean;
  // Divider modifier: rows are ruled by default; `flush` removes the hairlines.
  flush?: boolean;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

type Variant = "two-line" | "clickable" | "card";

// Variant precedence when more than one is passed: first match wins.
function variantOf(p: StackedListProps): Variant {
  if (p.clickable) return "clickable";
  if (p.card) return "card";
  return "two-line";
}

// Two initials from a name, used when an item supplies no explicit initials and
// no photo (e.g. "Rachel Chen" -> "RC").
function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function StackedList(props: StackedListProps) {
  const { items = [], title, action, addAction, rowMenu, onPressItem, onPressItemMenu, flush, style } = props;
  const variant = variantOf(props);
  const { tokens } = useTheme();

  // The header action: an explicit ReactNode wins; otherwise a small outlined
  // button with a leading plus icon when `addAction` supplies a label.
  const headerAction =
    action != null ? (
      action
    ) : addAction != null ? (
      <Button outline small>
        <View style={s.addActionRow}>
          <Icon plus size={13} />
          <Text style={s.addActionLabel(tokens)}>{addAction}</Text>
        </View>
      </Button>
    ) : null;

  // The card variant always rules its rows; the others rule unless `flush`.
  const ruled = variant === "card" ? true : !flush;
  const framed = variant === "card" || title != null;

  const lastIndex = items.length - 1;

  const renderColumn = (item: StackedListItem) => (
    <View style={s.column}>
      <Text style={s.nameLabel(tokens)} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={s.mutedLabel(tokens)} numberOfLines={1}>
        {item.detail}
      </Text>
    </View>
  );

  const renderTrailing = (item: StackedListItem) => {
    if (item.badge != null) return <Badge secondary>{item.badge}</Badge>;
    if (item.meta != null) return <Text style={s.mutedLabel(tokens)}>{item.meta}</Text>;
    return null;
  };

  // A ghost overflow ("...") action-menu button drawn as three horizontal dots;
  // the Icon set has no more-horizontal glyph, so the dots are primitives.
  const renderMenu = (index: number) => (
    <Pressable
      style={({ pressed }) => [s.menuButton, pressed ? s.pressedSurface(tokens) : null]}
      onPress={(event) => onPressItemMenu?.(index, event)}
      accessibilityRole="button"
      accessibilityLabel="Actions"
    >
      <View style={s.menuDot(tokens)} />
      <View style={s.menuDot(tokens)} />
      <View style={s.menuDot(tokens)} />
    </Pressable>
  );

  const renderAvatar = (item: StackedListItem) => (
    <Avatar src={item.avatar} name={item.name}>
      {item.initials ?? initialsFrom(item.name)}
    </Avatar>
  );

  const rows = items.map((item, index) => {
    const divider = ruled && index < lastIndex ? s.rowDivider(tokens) : null;

    if (variant === "clickable") {
      return (
        <Pressable
          key={index}
          style={({ pressed }) => [s.rowBase, pressed ? s.pressedSurface(tokens) : null, divider]}
          onPress={(event) => onPressItem?.(index, event)}
          accessibilityRole="button"
        >
          {renderAvatar(item)}
          {renderColumn(item)}
          {renderTrailing(item)}
          {rowMenu ? renderMenu(index) : null}
          <Text style={s.mutedLabel(tokens)}>{"›"}</Text>
        </Pressable>
      );
    }

    return (
      <View key={index} style={[s.rowBase, divider]}>
        {renderAvatar(item)}
        {renderColumn(item)}
        {renderTrailing(item)}
        {rowMenu ? renderMenu(index) : null}
      </View>
    );
  });

  const header =
    title != null ? (
      <View style={s.header(tokens)}>
        <Text style={s.headerTitle(tokens)}>{title}</Text>
        {headerAction != null ? <View>{headerAction}</View> : null}
      </View>
    ) : null;

  return (
    <View style={[s.outer, framed ? s.cardSurface(tokens) : null, style]}>
      {header}
      {rows}
    </View>
  );
}
