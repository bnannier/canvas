import { useId, type ReactNode } from "react";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { Card, View, useTheme, type ColorTokens } from "@nannier/canvas";
import { CARD_BORDER } from "../../../../src/molecules/card/card.styles.js";

// A section card's stage (the Navigation page's `c-navbar` and `c-tab-bar` wells): the kit
// `Card sunken flush clip` well (`background:var(--bg2);border:1px solid var(--ln);
// border-radius:16px;overflow:hidden`) with the hand-off's blurred accent glow behind the
// live components, at the well's own height floor. The glow and the placeholder blocks
// below are explanatory scenery no kit component draws (the brand-illustration exception,
// decision OD-1), so they live here, built from tokens, and take no touches.

/** Where the glow's box sits in the well, in percent of the well (the hand-off's absolute box). */
export interface GlowBox {
  left: `${number}%`;
  top: `${number}%`;
  width: `${number}%`;
  height: `${number}%`;
  /** The glow's opacity (the hand-off's `opacity`). */
  opacity: number;
}

/**
 * The hand-off's glow: an ellipse box filled with `radial-gradient(circle, var(--ion),
 * transparent 65%)` under a large blur. React Native has no element blur, so the blur is
 * folded into the gradient: the accent falls off along a smooth curve to nothing at the
 * box's edge instead of at 65 %, which is what the blurred stop paints.
 */
function StageGlow({ box }: { box: GlowBox }) {
  const { tokens } = useTheme();
  const id = `glow${useId().replace(/[^A-Za-z0-9]/g, "")}`;
  const { left, top, width, height, opacity } = box;
  const falloff = [
    [0, 0.8],
    [0.25, 0.62],
    [0.45, 0.38],
    [0.65, 0.17],
    [0.82, 0.05],
    [1, 0],
  ] as const;
  return (
    <View style={{ position: "absolute", left, top, width, height, opacity, pointerEvents: "none" }}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            {falloff.map(([at, alpha]) => <Stop key={at} offset={at} stopColor={tokens.primary} stopOpacity={alpha} />)}
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/**
 * The stage well: the kit's sunken well around the glow and the live components, at least
 * `minHeight` tall (the hand-off's border box, so the floor inside the hairline is the rest),
 * its content pinned to the foot with `bottom` (the tab bar floating off the well's edge).
 */
export function SectionStage({ glow, minHeight, bottom, children }: { glow: GlowBox; minHeight: number; bottom?: boolean; children: ReactNode }) {
  return (
    <Card sunken flush clip>
      <View style={{ minHeight: minHeight - 2 * CARD_BORDER, justifyContent: bottom ? "flex-end" : "flex-start" }}>
        <StageGlow box={glow} />
        {children}
      </View>
    </Card>
  );
}

/** The placeholder fill: the hand-off's `--sf3`. */
const block = (tokens: ColorTokens) => tokens.secondary;

/**
 * The navbar stage's page body (`padding:24px;display:flex;flex-direction:column;gap:14px`):
 * a 12 px heading bar at 40 % (radius 6), three 80 px tiles 12 apart and a 100 px block
 * (radius 14), all in the raised surface, at least the body's 280 px tall.
 */
export function PagePlaceholder() {
  const { tokens } = useTheme();
  const fill = block(tokens);
  return (
    <View style={{ minHeight: 280, padding: 24, gap: 14, pointerEvents: "none" }} aria-hidden>
      <View style={{ height: 12, width: "40%", borderRadius: 6, backgroundColor: fill }} />
      <View style={{ flexDirection: "row", gap: 12 }}>
        {[0, 1, 2].map((key) => <View key={key} style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", minWidth: 0, height: 80, borderRadius: 14, backgroundColor: fill }} />)}
      </View>
      <View style={{ height: 100, width: "100%", borderRadius: 14, backgroundColor: fill }} />
    </View>
  );
}
