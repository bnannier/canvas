import { type ReactNode } from "react";
import { type GestureResponderEvent } from "react-native";
import { cn } from "../cn.js";
import { View, Pressable, Text } from "../engine/index.js";
import { Avatar } from "./avatar.js";
import { Badge } from "./badge.js";
import { Button } from "./button.js";
import { Icon } from "./icon.js";

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
  className?: string;
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

// The card surface used by the `card` variant and as the optional frame for the
// other variants when a title is supplied (mirrors the docs `cardCls`).
const CARD_SURFACE = "rounded-lg border border-border bg-card overflow-hidden shadow-sm";

const ROW_BASE = "flex-row items-center gap-3 px-5 py-3";
const NAME_LABEL = "text-sm font-medium text-foreground";
const DETAIL_LABEL = "text-xs text-muted-foreground";
const META_LABEL = "text-xs text-muted-foreground";

export function StackedList(props: StackedListProps) {
  const { items = [], title, action, addAction, rowMenu, onPressItem, onPressItemMenu, flush, className } = props;
  const variant = variantOf(props);

  // The header action: an explicit ReactNode wins; otherwise a small outlined
  // button with a leading plus icon when `addAction` supplies a label.
  const headerAction =
    action != null ? (
      action
    ) : addAction != null ? (
      <Button outline small>
        <View className="flex-row items-center gap-1.5">
          <Icon plus size={13} />
          <Text className="text-xs font-medium text-foreground">{addAction}</Text>
        </View>
      </Button>
    ) : null;

  // The card variant always rules its rows; the others rule unless `flush`.
  const ruled = variant === "card" ? true : !flush;
  const framed = variant === "card" || title != null;

  const lastIndex = items.length - 1;

  const renderColumn = (item: StackedListItem) => (
    <View className="flex-1">
      <Text className={NAME_LABEL} numberOfLines={1}>
        {item.name}
      </Text>
      <Text className={DETAIL_LABEL} numberOfLines={1}>
        {item.detail}
      </Text>
    </View>
  );

  const renderTrailing = (item: StackedListItem) => {
    if (item.badge != null) return <Badge secondary>{item.badge}</Badge>;
    if (item.meta != null) return <Text className={META_LABEL}>{item.meta}</Text>;
    return null;
  };

  // A ghost overflow ("...") action-menu button drawn as three horizontal dots;
  // the Icon set has no more-horizontal glyph, so the dots are primitives.
  const renderMenu = (index: number) => (
    <Pressable
      className="h-7 w-7 flex-row items-center justify-center gap-1 rounded-md bg-transparent active:bg-accent"
      onPress={(event) => onPressItemMenu?.(index, event)}
      accessibilityRole="button"
      accessibilityLabel="Actions"
    >
      <View className="h-1 w-1 rounded-full bg-foreground" />
      <View className="h-1 w-1 rounded-full bg-foreground" />
      <View className="h-1 w-1 rounded-full bg-foreground" />
    </Pressable>
  );

  const renderAvatar = (item: StackedListItem) => (
    <Avatar src={item.avatar} name={item.name}>
      {item.initials ?? initialsFrom(item.name)}
    </Avatar>
  );

  const rows = items.map((item, index) => {
    const divider = ruled && index < lastIndex && "border-b border-border";

    if (variant === "clickable") {
      return (
        <Pressable
          key={index}
          className={cn(ROW_BASE, "active:bg-accent", divider)}
          onPress={(event) => onPressItem?.(index, event)}
          accessibilityRole="button"
        >
          {renderAvatar(item)}
          {renderColumn(item)}
          {renderTrailing(item)}
          {rowMenu ? renderMenu(index) : null}
          <Text className="text-xs text-muted-foreground">{"›"}</Text>
        </Pressable>
      );
    }

    return (
      <View key={index} className={cn(ROW_BASE, divider)}>
        {renderAvatar(item)}
        {renderColumn(item)}
        {renderTrailing(item)}
        {rowMenu ? renderMenu(index) : null}
      </View>
    );
  });

  const header =
    title != null ? (
      <View className="flex-row items-center justify-between border-b border-border px-5 py-3">
        <Text className="text-sm font-semibold text-foreground">{title}</Text>
        {headerAction != null ? <View>{headerAction}</View> : null}
      </View>
    ) : null;

  return (
    <View className={cn("w-full max-w-[560px]", framed && CARD_SURFACE, className)}>
      {header}
      {rows}
    </View>
  );
}
