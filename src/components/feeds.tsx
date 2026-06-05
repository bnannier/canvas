import { cn } from "../cn.js";
import { Box, Text } from "../engine/index.js";
import { Avatar } from "./avatar.js";

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
  className?: string;
}

type Lead = "connector" | "avatar";

// Lead precedence when more than one is passed: first match wins.
function leadOf(p: FeedProps): Lead {
  if (p.connector) return "connector";
  if (p.avatar) return "avatar";
  return "connector";
}

// The card surface framing the feed (mirrors the docs cardCls).
const CARD_SURFACE = "w-full max-w-[560px] rounded-lg border border-border bg-card overflow-hidden";

// Two initials from an actor name, used for the avatar/node fallback when no
// photo is supplied (e.g. "Rachel Chen" -> "RC").
function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const ACTOR_LABEL = "text-sm font-medium text-foreground";
const ACTION_LABEL = "text-sm text-muted-foreground";
const TIME_LABEL = "text-xs text-muted-foreground";

// The leading node for the connector variant: a small bordered circle carrying
// the actor's initials, sized to sit on the connector line.
const NODE_BASE = "h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card";

export function Feed(props: FeedProps) {
  const { items = [], className } = props;
  const lead = leadOf(props);
  const compact = !!props.compact;
  const lastIndex = items.length - 1;

  const renderContent = (item: FeedItem) => (
    <Box className="flex-1">
      <Text className="text-sm">
        {item.actor ? <Text className={ACTOR_LABEL}>{item.actor} </Text> : null}
        <Text className={ACTION_LABEL}>{item.action}</Text>
        {item.target ? <Text className={ACTION_LABEL}> {item.target}</Text> : null}
      </Text>
      <Text className={cn(TIME_LABEL, "mt-0.5")}>{item.time}</Text>
    </Box>
  );

  if (lead === "avatar") {
    // Avatar lead: each row leads with the actor's avatar; rows are ruled by a
    // hairline between items (the last row keeps no rule).
    const rowPad = compact ? "px-5 py-3" : "px-5 py-4";
    const rows = items.map((item, index) => {
      const divider = index < lastIndex && "border-b border-border";
      return (
        <Box key={index} className={cn("flex-row items-start gap-3", rowPad, divider)}>
          <Avatar src={item.avatar} name={item.actor}>
            {item.actor ? initialsFrom(item.actor) : ""}
          </Avatar>
          {renderContent(item)}
        </Box>
      );
    });
    return <Box className={cn(CARD_SURFACE, className)}>{rows}</Box>;
  }

  // Connector lead: a bordered node per row with a vertical line linking each
  // event to the next. The line is dropped on the final item.
  const pad = compact ? "p-5" : "p-6";
  const rowGap = compact ? "pb-4" : "pb-6";
  const rows = items.map((item, index) => {
    const isLast = index === lastIndex;
    return (
      <Box key={index} className={cn("relative flex-row gap-3", !isLast && rowGap)}>
        {!isLast ? (
          // Vertical connector: a 1px border-colored line running from just below
          // the node down to the next row. Absolutely placed under the node's
          // horizontal center (node is 28px wide -> center at 14px, minus the
          // 0.5px line half-width lands at 13px).
          <Box className="absolute bottom-0 left-[13px] top-7 w-px bg-border" />
        ) : null}
        <Box className={NODE_BASE}>
          {item.actor ? (
            <Text className="text-xs font-medium text-muted-foreground">
              {initialsFrom(item.actor)}
            </Text>
          ) : (
            <Box className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
          )}
        </Box>
        <Box className="flex-1 pt-0.5">{renderContent(item)}</Box>
      </Box>
    );
  });

  return <Box className={cn(CARD_SURFACE, pad, className)}>{rows}</Box>;
}
