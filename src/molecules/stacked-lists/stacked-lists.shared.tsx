import { Fragment, type ComponentType, type ReactNode } from "react";
import { FlatList, StyleSheet, type GestureResponderEvent } from "react-native";
import { View, Pressable, Text, RippleClip, cornerRadii, useTheme, devWarn, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Avatar as WebAvatar } from "../../atoms/avatar/avatar.js";
import { Badge as WebBadge } from "../../atoms/badge/badge.js";
import { Button as WebButton } from "../../atoms/button/button.js";
import { Icon } from "../../atoms/icon/icon.js";
import { type AvatarProps } from "../../atoms/avatar/avatar.shared.js";
import { type BadgeProps } from "../../atoms/badge/badge.shared.js";
import { type ButtonProps } from "../../atoms/button/button.shared.js";
import * as s from "./stacked-lists.styles.js";
import { type StackedListSkin } from "./stacked-lists.styles.js";

// Shared StackedList shell. The structure (an outer frame, an optional titled
// header, and a column of rows: leading avatar + primary/secondary text column +
// trailing meta/badge/action + optional overflow menu + clickable chevron), the
// boolean-prop axes, the item/data shapes, and the platform-neutral logic
// (variant precedence, initials derivation, divider/frame resolution) live here
// once; a platform file supplies only its skin (frame shape/shadow, row density,
// type tracking, divider inset, press feedback) and calls createStackedList.
//
// A stacked list is a vertical list of rows separated by hairlines, each row a
// leading avatar, a primary + secondary text column, and trailing meta/badge/
// action. It is the building block for contact lists, activity feeds, and data
// previews.
//
// StackedList is a "Light" platform treatment: ONE structure and one set of
// (semantic) colors, with per-OS touches limited to corner radius, density /
// spacing, type tracking, shadow/elevation, divider inset, and press feedback
// (Android android_ripple on this component's own pressable rows; iOS/web
// pressedOpacity). Web keeps the current Canvas look exactly; iOS uses SF/HIG
// inset-list conventions; Android uses Material 3 list / card conventions.
//
// As a content-layer surface (the frame paints tokens.card) it stays SOLID even
// when the ThemeProvider's surface is "glass": glass only turns the popover-layer
// overlays translucent, never the card.
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
  /** Stable identity for the row's React key, so reorder/insert/delete keeps a
   *  row mapped to the same item (preserving in-progress press/hover/focus state
   *  and avoiding needless avatar remounts). The array index is the fallback,
   *  which is only safe for static, never-reordered lists. */
  id?: string | number;
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
  /**
   * Render the rows through a windowed `FlatList` instead of mounting every row up
   * front, for large lists. Give the list a bounded height (via `style`, e.g.
   * `{ maxHeight: 400 }`) so it can scroll; without one it warns and renders eagerly
   * anyway. Default (omitted) mounts all rows, unchanged.
   */
  virtualized?: boolean;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

type Variant = "two-line" | "clickable" | "card";

// Variant precedence when more than one is passed: first match wins.
function variantOf(p: StackedListProps): Variant {
  if (p.clickable) return "clickable";
  if (p.card) return "card";
  return "two-line";
}

// The composed-atom component types, so each platform can pass its own resolved
// atoms (web base by default) without widening to `any`.
export type AvatarComponent = ComponentType<AvatarProps>;
export type BadgeComponent = ComponentType<BadgeProps>;
export type ButtonComponent = ComponentType<ButtonProps>;

// createStackedList threads the platform skin AND the platform-styled composed
// atoms. The atom params default to the web base atoms so the web entry (and any
// barrel import) composes web-styled rows; the .ios/.android entry files pass the
// literal per-OS atoms so the WEB docs 3-up renders each row's avatar/badge/Add
// button in its own platform skin (a barrel import would resolve the web atoms in
// the browser bundle). The signature change is internal; the public component
// export is unchanged, so it stays backward-compatible.
export function createStackedList(
  skin: StackedListSkin,
  Avatar: AvatarComponent = WebAvatar,
  Badge: BadgeComponent = WebBadge,
  Button: ButtonComponent = WebButton,
) {
  return function StackedList(props: StackedListProps) {
    const { items = [], title, action, addAction, rowMenu, onPressItem, onPressItemMenu, flush, virtualized, testID, style } = props;
    const variant = variantOf(props);
    const { tokens } = useTheme();

    // The Android ripple over the component's own pressable rows / overflow menu;
    // null on iOS/web where pressed opacity carries the feedback instead.
    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;
    const pressFeedback = (pressed: boolean) =>
      skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null;

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
        <Text style={skin.nameLabel(tokens)} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={skin.mutedLabel(tokens)} numberOfLines={1}>
          {item.detail}
        </Text>
      </View>
    );

    const renderTrailing = (item: StackedListItem) => {
      if (item.badge != null) return <Badge secondary>{item.badge}</Badge>;
      if (item.meta != null) return <Text style={skin.metaLabel(tokens)}>{item.meta}</Text>;
      return null;
    };

    // A ghost overflow ("...") action-menu button drawn as three horizontal dots;
    // the Icon set has no more-horizontal glyph, so the dots are primitives. The
    // hitSlop (native skins only) grows the effective target to the platform
    // minimum (44pt iOS / 48dp Android) while the visual box stays 28.
    const renderMenu = (index: number) => (
      // The bounded ripple is clipped to the round menu button by this RippleClip
      // parent (a node can never clip its own ripple on Android); fixed-size icon
      // button, so no outer layout moves to the wrapper.
      <RippleClip shape={cornerRadii(skin.menuButton)}>
        <Pressable
          style={({ pressed }) => [skin.menuButton, pressed ? skin.pressedSurface(tokens) : null, pressFeedback(pressed)]}
          hitSlop={skin.menuHitSlop}
          android_ripple={ripple}
          onPress={(event) => onPressItemMenu?.(index, event)}
          accessibilityRole="button"
          accessibilityLabel="Actions"
        >
          <View style={s.menuDot(tokens)} />
          <View style={s.menuDot(tokens)} />
          <View style={s.menuDot(tokens)} />
        </Pressable>
      </RippleClip>
    );

    // The decorative drilldown chevron: an SF-semibold text glyph on iOS/web, a
    // 24dp Icon on Android (the M3 trailing affordance). Either way it is hidden
    // from assistive tech (the row's `button` role already conveys actionability;
    // the Icon glyph is `decorative`, the text glyph carries the aria-hidden
    // aliases; importantForAccessibility is not forwarded on web).
    const renderChevron = () =>
      skin.chevronIcon != null ? (
        <Icon chevronRight muted decorative size={skin.chevronIcon} />
      ) : (
        <Text
          style={skin.chevronGlyph!(tokens)}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          aria-hidden
        >
          {"›"}
        </Text>
      );

    const renderAvatar = (item: StackedListItem) => (
      // `name` flows the human name to Avatar for the accessible label/alt text;
      // an explicit `item.initials` wins verbatim through Avatar's dedicated
      // `initials` prop, otherwise Avatar reduces the name to its initials.
      <Avatar src={item.avatar} name={item.name} initials={item.initials} />
    );

    // One row, keyless so it can be used both by the eager `.map` (which supplies
    // the key) and by FlatList's renderItem (which keys via keyExtractor).
    const renderRow = (item: StackedListItem, index: number) => {
      // The divider is an absolute bottom hairline CHILD, never a border+margin
      // merged into the row's own style: the iOS skin insets the rule past the
      // avatar (marginStart-style), and on the row itself that margin would
      // shift the entire row's content, not just the separator.
      const divider = ruled && index < lastIndex ? <View pointerEvents="none" style={skin.rowDivider(tokens)} /> : null;
      if (variant === "clickable") {
        return (
          <Pressable
            style={({ pressed }) => [skin.rowBase, pressed ? skin.pressedSurface(tokens) : null, pressFeedback(pressed)]}
            android_ripple={ripple}
            onPress={(event) => onPressItem?.(index, event)}
            accessibilityRole="button"
          >
            {renderAvatar(item)}
            {renderColumn(item)}
            {renderTrailing(item)}
            {rowMenu ? renderMenu(index) : null}
            {renderChevron()}
            {divider}
          </Pressable>
        );
      }
      return (
        <View style={skin.rowBase}>
          {renderAvatar(item)}
          {renderColumn(item)}
          {renderTrailing(item)}
          {rowMenu ? renderMenu(index) : null}
          {divider}
        </View>
      );
    };

    // Stable identity when the caller supplies one; the array index is the fallback
    // for static lists only (see StackedListItem.id).
    const keyOf = (item: StackedListItem, index: number) => String(item.id ?? index);

    const header =
      title != null ? (
        <View style={skin.header(tokens)}>
          <Text style={skin.headerTitle(tokens)}>{title}</Text>
          {headerAction != null ? <View>{headerAction}</View> : null}
        </View>
      ) : null;

    // A windowed list needs a bounded height to scroll (and to actually window). Warn
    // once if `virtualized` is set without one; a FlatList with no height falls back
    // to rendering every row anyway, so the flag would be a silent no-op.
    const flat = (StyleSheet.flatten(style) ?? {}) as ViewStyle;
    const bounded = flat.height != null || flat.maxHeight != null || flat.flex != null || flat.flexBasis != null;
    devWarn(
      !!virtualized && !bounded,
      "[canvas] <StackedList virtualized>: give the list a bounded height (e.g. style={{ maxHeight: 400 }}) so it can window and scroll; rendering eagerly for now.",
    );

    const body =
      virtualized && bounded ? (
        <FlatList
          data={items}
          renderItem={({ item, index }) => renderRow(item, index)}
          keyExtractor={keyOf}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        items.map((item, index) => <Fragment key={keyOf(item, index)}>{renderRow(item, index)}</Fragment>)
      );

    return (
      <View testID={testID} style={[s.outer, framed ? skin.cardSurface(tokens) : null, style]}>
        {header}
        {body}
      </View>
    );
  };
}
