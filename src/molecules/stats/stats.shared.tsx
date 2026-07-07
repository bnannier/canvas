import { type ReactNode } from "react";
import { View, Pressable, Text, useTheme, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
import { deltaTone, item as itemLayout, row, type Surface } from "./stats.styles.js";

// Shared Stats shell. The structure (a wrapping row/grid of metric stacks, each a
// small label, a large headline value, and an optional delta), the boolean-prop
// axes, the data-shape types, the a11y, and the semantic delta-tone logic live
// here once; a platform file supplies only its skin (surface shape/padding/shadow,
// row density, title/label/value/delta type, and press feedback) and calls
// createStats.
//
// Two surfaces, one axis (`plain` vs the default card):
//
// 1. Card (default): each metric sits in its own bordered card. Good for a
//    standalone metric or a free-standing group on a bare page.
// 2. Plain (`plain`): the metric stacks sit borderless on a shared parent surface,
//    so you don't draw boxes inside a box. Pair with a parent card.
//
// Layout is responsive by default: items lay out in a wrapping row, each holding a
// sensible minimum width, so a group reflows from a single row on desktop down to a
// stack on a phone without any per-breakpoint props.
//
// Boolean-prop API: one boolean per option, first-match precedence within an axis
// (mirrors Button's intentOf). `items` carries the plain data; each item's `down`
// flag colors its delta red instead of the default green.
//
// Stats is a "Light" platform treatment: one structure and one set of (semantic)
// colors, with per-OS touches limited to corner radius, density, type tracking,
// shadow-vs-outline, and press feedback — so the skin carries only those, not the
// colors or the layout contract.

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
  /** Make each metric a tappable target (drill into the underlying detail). When
   *  set, every metric renders as a Pressable with a button role and a pressed
   *  affordance, so a tappable stat needs no hand-rolled Pressable. */
  onPressItem?: (index: number) => void;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Escape hatch for layout/positioning composition (mainly width). */
  style?: StyleProp<ViewStyle>;
}

// The per-OS-varying style pieces a platform skin fulfills. Everything else (the
// structure, the metric layout, the semantic delta color) is shared.
export interface StatsSkin {
  /** The bordered card surface each metric sits in (shape, border, padding, shadow). */
  cardSurface: (tokens: ColorTokens) => ViewStyle;
  /** The parent surface the plain variant nests on. */
  plainContainer: (tokens: ColorTokens) => ViewStyle;
  /** Row gap by surface (cards pack tighter, plain stacks sit roomier). */
  rowGap: Record<Surface, ViewStyle>;
  /** Title type + spacing, by surface. */
  title: (tokens: ColorTokens, surface: Surface) => TextStyle;
  /** The small caption above the value. */
  labelText: (tokens: ColorTokens) => TextStyle;
  /** The headline figure type. */
  valueText: (tokens: ColorTokens) => TextStyle;
  /** The delta type base (the tone color is layered on top by the shell). */
  deltaBase: TextStyle;
  /** iOS/web dim on a pressed tappable item; Android uses a ripple instead (null). */
  pressedOpacity: number | null;
  /** Android ripple over a tappable item; null on iOS/web. */
  ripple: ((tokens: ColorTokens) => { color: string; borderless: boolean }) | null;
}

// Surface precedence when more than one is passed: first match wins.
function surfaceOf(p: StatsProps): Surface {
  if (p.plain) return "plain";
  return "card";
}

export function createStats(skin: StatsSkin) {
  // One metric: label, value, optional delta. Tappable when an onPress is given.
  function StatItemView({ item, surface, onPress }: { item: StatItem; surface: Surface; onPress?: () => void }): ReactNode {
    const { tokens, dark } = useTheme();
    const container = [surface === "card" ? skin.cardSurface(tokens) : null, itemLayout[surface]];
    const inner = (
      <>
        <Text style={skin.labelText(tokens)}>{item.label}</Text>
        <Text style={skin.valueText(tokens)}>{item.value}</Text>
        {item.delta != null && item.delta !== "" ? (
          <Text style={[skin.deltaBase, deltaTone(dark, !!item.down)]}>{item.delta}</Text>
        ) : null}
      </>
    );
    if (onPress) {
      const android_ripple = skin.ripple ? skin.ripple(tokens) : undefined;
      return (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          android_ripple={android_ripple}
          style={({ pressed }) => [container, pressed && skin.pressedOpacity != null ? { opacity: skin.pressedOpacity } : null]}
        >
          {inner}
        </Pressable>
      );
    }
    return <View style={container}>{inner}</View>;
  }

  return function Stats(props: StatsProps) {
    const { items, title, testID, style, onPressItem } = props;
    const { tokens } = useTheme();
    const surface = surfaceOf(props);

    // The card surface lays cards directly in a wrapping, gapped row. The plain
    // surface wraps the stacks in a shared parent card so the borderless metrics
    // have something to sit on.
    const isPlain = surface === "plain";

    return (
      <View testID={testID} style={[isPlain ? skin.plainContainer(tokens) : null, style]}>
        {title != null && title !== "" ? <Text style={skin.title(tokens, surface)}>{title}</Text> : null}
        <View style={[row, skin.rowGap[surface]]}>
          {items.map((item, i) => (
            <StatItemView key={i} item={item} surface={surface} onPress={onPressItem ? () => onPressItem(i) : undefined} />
          ))}
        </View>
      </View>
    );
  };
}
