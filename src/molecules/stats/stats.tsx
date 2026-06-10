import { type ReactNode } from "react";
import { View, Text, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import * as s from "./stats.styles.js";
import { type Surface } from "./stats.styles.js";

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
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

// Surface precedence when more than one is passed: first match wins.
function surfaceOf(p: StatsProps): Surface {
  if (p.plain) return "plain";
  return "card";
}

// One metric: label, value, optional delta.
function StatItemView({ item, surface }: { item: StatItem; surface: Surface }): ReactNode {
  const { tokens, dark } = useTheme();
  return (
    <View style={[surface === "card" ? s.cardSurface(tokens) : null, s.item[surface]]}>
      <Text style={s.labelText(tokens)}>{item.label}</Text>
      <Text style={s.valueText(tokens)}>{item.value}</Text>
      {item.delta != null && item.delta !== "" ? (
        <Text style={[s.deltaBase, s.deltaTone(dark, !!item.down)]}>{item.delta}</Text>
      ) : null}
    </View>
  );
}

export function Stats(props: StatsProps) {
  const { items, title, style } = props;
  const { tokens } = useTheme();
  const surface = surfaceOf(props);

  // The card surface lays cards directly in a wrapping, gapped row. The plain
  // surface wraps the stacks in a shared parent card so the borderless metrics
  // have something to sit on.
  const isPlain = surface === "plain";

  return (
    <View style={[isPlain ? s.plainContainer(tokens) : null, style]}>
      {title != null && title !== "" ? <Text style={s.title(tokens, surface)}>{title}</Text> : null}
      <View style={[s.row, s.rowGap[surface]]}>
        {items.map((item, i) => (
          <StatItemView key={i} item={item} surface={surface} />
        ))}
      </View>
    </View>
  );
}
