import { Children, Fragment, type ReactNode } from "react";
import { Card, Column, Divider, View, useTheme } from "@nannier/canvas";
import { CARD_BORDER } from "../../../../src/molecules/card/card.styles.js";
import { StageGlow } from "./stage";

// The Foundations page's specimen scaffolding (`Canvas v4.0.0 Foundations.dc.html`): the
// pieces of its cards that are diagrams of the kit's tables rather than components, so no
// kit component draws them (the brand-illustration exception, decision OD-1 and the
// Foundations owner decisions 2 and 3). Each is built from tokens and kit pieces, and none
// takes a touch.

/**
 * The type card's specimen table (`display:grid;...;padding:12px 0;border-bottom:1px solid
 * var(--ln)` per row, the rows the card's own children at its 4 px gap): each row 12 px
 * above and below its content, a hairline under every row but the last, and the card's gap
 * plus the next row's padding (16) below the hairline.
 */
export function SpecimenRows({ children }: { children: ReactNode }) {
  const rows = Children.toArray(children);
  return (
    <View style={{ paddingVertical: 12 }}>
      <Column cozy>
        {rows.map((row, index) => index === 0 ? <Fragment key={index}>{row}</Fragment> : (
          <Column key={index} relaxed>
            <Divider />
            {row}
          </Column>
        ))}
      </Column>
    </View>
  );
}

/**
 * A blank radius sample (the shape card's `width:N;height:N;border-radius:R;background:
 * var(--sf3);border:1px solid var(--ln2)` boxes), drawn at the kit's own corner for the role
 * the caption names: `width` by `height` (square unless given) at `radius`.
 */
export function RadiusSample({ width, height = width, radius }: { width: number; height?: number; radius: number }) {
  const { tokens } = useTheme();
  return (
    <View
      aria-hidden
      style={{ width, height, borderRadius: radius, backgroundColor: tokens.secondary, borderWidth: 1, borderColor: tokens["field-border"] ?? tokens.input, pointerEvents: "none" }}
    />
  );
}

/** The depth card's glass well, inside its hairline: the hand-off's border box less the border. */
const WELL_HEIGHT = 120 - 2 * CARD_BORDER;
/** The floating pane's inset from the well's edge (`left:24px;right:24px;top:24px;bottom:24px`). */
const PANE_INSET = 24;

/**
 * The depth card's glass demo (`position:relative;height:120px;border-radius:14px;
 * overflow:hidden;border:1px solid var(--ln)`): the kit's outlined callout Card as the well,
 * the two blurred orbs behind (the accent at left -10% top -40%, 60% by 180% at .8, and the
 * cyan series hue at right -10% top -20%, 50% by 160% at .7), and the pane the caller
 * passes laid over them at the hand-off's 24 px inset.
 */
export function GlassWell({ children }: { children: ReactNode }) {
  return (
    <Card outlined flush clip calloutCorners>
      <View style={{ height: WELL_HEIGHT }}>
        <StageGlow box={{ left: "-10%", top: "-40%", width: "60%", height: "180%", opacity: 0.8 }} />
        <StageGlow box={{ left: "60%", top: "-20%", width: "50%", height: "160%", opacity: 0.7, color: "chart-2" }} />
        <View style={{ position: "absolute", top: PANE_INSET, right: PANE_INSET, bottom: PANE_INSET, left: PANE_INSET }}>
          {children}
        </View>
      </View>
    </Card>
  );
}
