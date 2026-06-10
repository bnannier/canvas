import { type ReactNode } from "react";
import { View, Pressable, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import { Avatar } from "../../atoms/avatar/avatar.js";
import * as s from "./feeds.styles.js";

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

/** One event in the feed. */
export interface FeedItem {
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

type Lead = "connector" | "avatar";

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

export function Feed(props: FeedProps) {
  const { items = [], onItemPress, style } = props;
  const { tokens } = useTheme();
  const lead = leadOf(props);
  const compact = !!props.compact;
  const lastIndex = items.length - 1;

  const renderContent = (item: FeedItem) => (
    <View style={s.contentColumn}>
      <Text style={s.lineText}>
        {item.actor ? <Text style={s.actorLabel(tokens)}>{item.actor} </Text> : null}
        <Text style={s.actionLabel(tokens)}>{item.action}</Text>
        {item.target ? <Text style={s.actionLabel(tokens)}> {item.target}</Text> : null}
      </Text>
      <Text style={s.timeLabel(tokens)}>{item.time}</Text>
    </View>
  );

  if (lead === "avatar") {
    // Avatar lead: each row leads with the actor's avatar; rows are ruled by a
    // hairline between items (the last row keeps no rule).
    const rows = items.map((item, index) => {
      const divider = index < lastIndex ? s.avatarDivider(tokens) : null;
      const rowStyle: StyleProp<ViewStyle> = [s.avatarRow, s.avatarRowPad(compact), divider];
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
            key={index}
            accessibilityRole="button"
            onPress={() => onItemPress(index)}
            style={({ pressed }) => [rowStyle, pressed ? { backgroundColor: tokens.accent } : null]}
          >
            {inner}
          </Pressable>
        );
      }
      return (
        <View key={index} style={rowStyle}>
          {inner}
        </View>
      );
    });
    return <View style={[s.cardSurface(tokens), style]}>{rows}</View>;
  }

  // Connector lead: a bordered node per row with a vertical line linking each
  // event to the next. The line is dropped on the final item.
  const rows = items.map((item, index) => {
    const isLast = index === lastIndex;
    const rowStyle: StyleProp<ViewStyle> = [s.connectorRow, isLast ? null : s.connectorRowGap(compact)];
    const inner: ReactNode = (
      <>
        {!isLast ? (
          // Vertical connector: a 1px border-colored line running from just below
          // the node down to the next row. Absolutely placed under the node's
          // horizontal center (node is 28px wide -> center at 14px, minus the
          // 0.5px line half-width lands at 13px).
          <View style={s.connectorLine(tokens)} />
        ) : null}
        <View style={s.node(tokens)}>
          {item.actor ? (
            <Text style={s.nodeInitials(tokens)}>{initialsFrom(item.actor)}</Text>
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
          key={index}
          accessibilityRole="button"
          onPress={() => onItemPress(index)}
          style={({ pressed }) => [rowStyle, pressed ? { backgroundColor: tokens.accent } : null]}
        >
          {inner}
        </Pressable>
      );
    }
    return (
      <View key={index} style={rowStyle}>
        {inner}
      </View>
    );
  });

  return <View style={[s.cardSurface(tokens), s.connectorPad(compact), style]}>{rows}</View>;
}
