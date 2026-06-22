import { type ReactNode } from "react";
import {
  View,
  Pressable,
  Text,
  useTheme,
  type ColorTokens,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "../../style/index.js";
import { Avatar } from "../../atoms/avatar/avatar.js";
import * as s from "./feeds.styles.js";

// Shared Feed shell. The structure (a card surface framing connector-node rows or
// avatar rows, with an actor/action line plus a relative timestamp), the
// boolean-prop axes, the lead/density precedence, and the initials fallback live
// here once; a platform file supplies only its skin (card shape, row density,
// label tracking, press feedback) and calls createFeed.
//
// An activity feed is a vertical timeline of events. Each item is a row with a
// leading mark (a small dot/initials node or a person's avatar), a content
// column carrying the actor + action + target line, and a muted timestamp.
//
// Two lead variants:
//
// 1. The connector feed (default): each row leads with a small bordered node
//    and a vertical connector line links one event to the next. The connector
//    is dropped on the final item so the line terminates cleanly at the last
//    event rather than dangling past it.
// 2. The avatar feed (`avatar`): each row leads with the actor's avatar and the
//    rows are separated by hairline rules instead of a connector line.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf). The lead axis picks
// between the connector node and the avatar; `compact` is an orthogonal density
// modifier that tightens the vertical rhythm.
//
// Feed is a "Light" platform treatment: one structure and one set of (semantic)
// colors, with per-OS touches limited to card radius, row density, label
// tracking, and press feedback — so the skin carries only those, not the colors
// or the markup.

/** One event in the feed. */
export interface FeedItem {
  /**
   * Stable identity for this event, used as the row's React key. Supply it for
   * mutable or reordered feeds (the common timeline case is prepending the
   * newest event): without it the rows fall back to their array index, which
   * desyncs per-row state and press feedback when items are inserted at the
   * front or reordered.
   */
  id?: string | number;
  /** Actor who performed the action, rendered bold (e.g. "Rachel Chen"). */
  actor?: string;
  /** The action text, muted (e.g. "approved the request"). */
  action: string;
  /** Optional target of the action, muted and trailing the action. */
  target?: string;
  /** Relative timestamp, muted and small (e.g. "2 hours ago"). */
  time: string;
  /** Photo URL for the avatar lead; falls back to initials from the actor. */
  avatar?: string;
}

export interface FeedProps {
  /** Events to render, top to bottom. */
  items?: FeedItem[];
  // Lead axis (pick one; default is the connector node + vertical line).
  connector?: boolean;
  avatar?: boolean;
  // Density modifier: tightens the row padding and connector spacing.
  compact?: boolean;
  /** When set, each event row is pressable, reporting the row index. */
  onItemPress?: (index: number) => void;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

export type Lead = "connector" | "avatar";

// The contract a platform skin fulfills. The shell renders the card surface, the
// connector/avatar rows, the node, the connector line, and the labels; the skin
// maps the active platform's shape/density/type/feedback onto each piece. Color
// logic stays in the shell (driven by tokens) since Feed is a Light treatment.
export interface FeedSkin {
  /** The card surface framing the feed (shape, border, fill, max-width). */
  cardSurface: (t: ColorTokens) => ViewStyle;
  /** Connector surface padding by density (compact vs default). */
  connectorPad: (compact: boolean) => ViewStyle;
  /** Inter-row vertical rhythm by density for the connector lead (dropped on last). */
  connectorRowGap: (compact: boolean) => ViewStyle;
  /** Avatar row padding by density (compact vs default). */
  avatarRowPad: (compact: boolean) => ViewStyle;
  /** The hairline rule between avatar rows; omitted on the last row. */
  avatarDivider: (t: ColorTokens) => ViewStyle;
  /** The leading connector node (a small bordered circle). */
  node: (t: ColorTokens) => ViewStyle;
  /** The vertical connector line under the node center. */
  connectorLine: (t: ColorTokens) => ViewStyle;
  /** The node's initials type. */
  nodeInitials: (t: ColorTokens) => TextStyle;
  /** The outer wrapping line (sizing only). */
  lineText: TextStyle;
  /** The actor name (bold, foreground). */
  actorLabel: (t: ColorTokens) => TextStyle;
  /** The action / target text (muted). */
  actionLabel: (t: ColorTokens) => TextStyle;
  /** The relative timestamp (muted, small). */
  timeLabel: (t: ColorTokens) => TextStyle;
  /** iOS/web dim on press of a row; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over pressable rows; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
}

// Lead precedence when more than one is passed: first match wins.
function leadOf(p: FeedProps): Lead {
  if (p.connector) return "connector";
  if (p.avatar) return "avatar";
  return "connector";
}

// Two initials from an actor name, used for the avatar/node fallback when no
// photo is supplied (e.g. "Rachel Chen" -> "RC").
function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function createFeed(skin: FeedSkin) {
  return function Feed(props: FeedProps) {
    const { items = [], onItemPress, style } = props;
    const { tokens } = useTheme();
    const lead = leadOf(props);
    const compact = !!props.compact;
    const lastIndex = items.length - 1;

    // Press feedback differs per OS: Android shows a native ripple (state layer)
    // on the row, iOS/web dim the row's opacity. The skin decides which.
    const ripple = skin.ripple ? skin.ripple(tokens) : undefined;

    const renderContent = (item: FeedItem) => (
      <View style={s.contentColumn}>
        <Text style={skin.lineText}>
          {item.actor ? <Text style={skin.actorLabel(tokens)}>{item.actor} </Text> : null}
          <Text style={skin.actionLabel(tokens)}>{item.action}</Text>
          {item.target ? <Text style={skin.actionLabel(tokens)}> {item.target}</Text> : null}
        </Text>
        <Text style={skin.timeLabel(tokens)}>{item.time}</Text>
      </View>
    );

    if (lead === "avatar") {
      // Avatar lead: each row leads with the actor's avatar; rows are ruled by a
      // hairline between items (the last row keeps no rule).
      const rows = items.map((item, index) => {
        const rowKey = item.id ?? index;
        const divider = index < lastIndex ? skin.avatarDivider(tokens) : null;
        const rowStyle: StyleProp<ViewStyle> = [s.avatarRow, skin.avatarRowPad(compact), divider];
        const inner: ReactNode = (
          <>
            <Avatar src={item.avatar} name={item.actor}>
              {item.actor ? initialsFrom(item.actor) : ""}
            </Avatar>
            {renderContent(item)}
          </>
        );
        if (onItemPress) {
          return (
            <Pressable
              key={rowKey}
              accessibilityRole="button"
              onPress={() => onItemPress(index)}
              android_ripple={ripple}
              style={({ pressed }) => [
                rowStyle,
                skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
              ]}
            >
              {inner}
            </Pressable>
          );
        }
        return (
          <View key={rowKey} style={rowStyle}>
            {inner}
          </View>
        );
      });
      return <View style={[skin.cardSurface(tokens), style]}>{rows}</View>;
    }

    // Connector lead: a bordered node per row with a vertical line linking each
    // event to the next. The line is dropped on the final item.
    const rows = items.map((item, index) => {
      const rowKey = item.id ?? index;
      const isLast = index === lastIndex;
      const rowStyle: StyleProp<ViewStyle> = [s.connectorRow, isLast ? null : skin.connectorRowGap(compact)];
      const inner: ReactNode = (
        <>
          {!isLast ? (
            // Vertical connector: a 1px border-colored line running from just below
            // the node down to the next row, absolutely placed under the node's
            // horizontal center; dropped on the final item.
            <View style={skin.connectorLine(tokens)} />
          ) : null}
          <View style={skin.node(tokens)}>
            {item.actor ? (
              <Text style={skin.nodeInitials(tokens)}>{initialsFrom(item.actor)}</Text>
            ) : (
              <View style={s.nodeDot(tokens)} />
            )}
          </View>
          <View style={s.connectorContentColumn}>{renderContent(item)}</View>
        </>
      );
      if (onItemPress) {
        return (
          <Pressable
            key={rowKey}
            accessibilityRole="button"
            onPress={() => onItemPress(index)}
            android_ripple={ripple}
            style={({ pressed }) => [
              rowStyle,
              skin.pressedOpacity != null && pressed ? { opacity: skin.pressedOpacity } : null,
            ]}
          >
            {inner}
          </Pressable>
        );
      }
      return (
        <View key={rowKey} style={rowStyle}>
          {inner}
        </View>
      );
    });

    return <View style={[skin.cardSurface(tokens), skin.connectorPad(compact), style]}>{rows}</View>;
  };
}
