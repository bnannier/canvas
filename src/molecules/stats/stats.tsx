import { type ReactNode } from "react";
import { cn } from "../../cn.js";
import { View, Text } from "../../engine/index.js";

// Stats: a row/grid of metric items, each a small label, a large headline value,
// and an optional delta (e.g. +12.5% in green, -3% in red). Used for dashboard
// and overview surfaces.
//
// Two surfaces, one axis (`plain` vs the default card):
//
// 1. Card (default): each metric sits in its own bordered, shadowed card. Good
//    for a standalone metric or a free-standing group on a bare page.
// 2. Plain (`plain`): the metric stacks sit borderless on a shared parent
//    surface, so you don't draw boxes inside a box. Pair with a parent card.
//
// Layout is responsive by default: items lay out in a wrapping row, each holding
// a sensible minimum width, so a group reflows from a single row on desktop down
// to a stack on a phone without any per-breakpoint props.
//
// Boolean-prop API: one boolean per option, first-match precedence within an
// axis (mirrors Button's intentOf). `items` carries the plain data; each item's
// `down` flag colors its delta red instead of the default green.

export interface StatItem {
  /** Small caption above the value (e.g. "Total users"). */
  label: string;
  /** The headline figure, pre-formatted (e.g. "12,847", "$48.2k", "3.6%"). */
  value: string;
  /** Optional change indicator (e.g. "+12.5%"). Omit to hide. */
  delta?: string;
  /** Color the delta red (a decline) instead of the default green (a rise). */
  down?: boolean;
}

export interface StatsProps {
  /** The metrics to render, in order. */
  items: StatItem[];
  // Surface (pick one; default is bordered cards).
  /** Borderless metric stacks on a shared surface, for nesting inside a card. */
  plain?: boolean;
  /** Optional heading shown above the metrics (mainly for the plain surface). */
  title?: string;
  className?: string;
}

type Surface = "card" | "plain";

// Surface precedence when more than one is passed: first match wins.
function surfaceOf(p: StatsProps): Surface {
  if (p.plain) return "plain";
  return "card";
}

// The bordered card surface, mirroring the docs `cardCls` plus its padding.
const CARD = "rounded-lg border border-border bg-card shadow-sm p-5";
// The parent surface the plain variant nests on.
const PLAIN_CONTAINER = "rounded-lg border border-border bg-card shadow-sm p-6";

// A wrapping row: items flow left to right and wrap to the next line when they
// run out of room, each keeping a minimum width so they stay scannable. This is
// the responsive replacement for the docs' auto-fit grid.
const ROW = "flex-row flex-wrap";

// Per-item minimum width and growth, by surface. Card items hold a wider floor
// (they carry their own chrome); plain stacks pack tighter.
const ITEM: Record<Surface, string> = {
  card: "flex-1 min-w-48",
  plain: "min-w-28",
};

const TITLE: Record<Surface, string> = {
  card: "text-sm font-semibold text-foreground mb-3",
  plain: "text-base font-semibold text-foreground mb-4",
};

// One metric: label, value, optional delta.
function StatItemView({ item, surface }: { item: StatItem; surface: Surface }): ReactNode {
  const deltaTone = item.down ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400";
  const cell = cn(surface === "card" ? CARD : "", ITEM[surface]);
  return (
    <View className={cell}>
      <Text className="text-sm text-muted-foreground">{item.label}</Text>
      <Text className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{item.value}</Text>
      {item.delta != null && item.delta !== "" ? (
        <Text className={cn("mt-1 text-xs font-medium", deltaTone)}>{item.delta}</Text>
      ) : null}
    </View>
  );
}

export function Stats(props: StatsProps) {
  const { items, title, className } = props;
  const surface = surfaceOf(props);

  // The card surface lays cards directly in a wrapping, gapped row. The plain
  // surface wraps the stacks in a shared parent card so the borderless metrics
  // have something to sit on.
  const isPlain = surface === "plain";
  const outer = cn(
    isPlain ? PLAIN_CONTAINER : "",
    className,
  );
  const row = cn(ROW, isPlain ? "gap-6" : "gap-3.5");

  return (
    <View className={outer}>
      {title != null && title !== "" ? <Text className={TITLE[surface]}>{title}</Text> : null}
      <View className={row}>
        {items.map((item, i) => (
          <StatItemView key={i} item={item} surface={surface} />
        ))}
      </View>
    </View>
  );
}
