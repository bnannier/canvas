import { useId, type ReactNode } from "react";
import Svg, { Circle, Defs, LinearGradient, Mask, Pattern, RadialGradient, Rect, Stop } from "react-native-svg";
import { Card, Column, Container, Row, Typography, View, useTheme } from "@nannier/canvas";
import { ACCENT } from "../../../../src/style/tokens.js";
import { CARD_BORDER } from "../../../../src/molecules/card/card.styles.js";
import type { Room } from "../../data/rooms";
import { DocsHead } from "../docs-head";
import { InlineMarkdown } from "../prose";
import { PreviewViewport } from "../preview-viewport";

// A section page's hero (`Canvas v4.0.0 <Section>.dc.html`, its first grid): the room's
// title, its tagline and the paragraph under it on the left, the section's vignette on the
// right, side by side until the hero's own width runs out and then stacked. The vignette is
// animated reference illustration: the owner reinstated the hand-off motion in D15.

export function SectionHero({ room, vignette }: { room: Pick<Room, "title" | "lead" | "body">; vignette: ReactNode }) {
  return (
    // The hand-off's hero grid: `grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));
    // gap:28px 40px`, its halves 40 apart beside each other (`ample`) and 28 apart once
    // stacked (`rowsPanel`). No cross-axis alignment on the Row: a stacked Row keeps its
    // alignment, and a centred column would hug the vignette instead of giving it the full
    // width. The text column centres its own content instead (the hand-off's
    // `align-items:center`): side by side it grows to its span cell's height (the row's) and
    // its text sits in the middle; stacked it is its content's height and the centring does
    // nothing.
    <Row stacks stackBreakpoint="md" ample rowsPanel>
      <Column span={6} grow center>
        {/* The hand-off's title block: `display:flex;flex-direction:column;gap:12px;max-width:620px`. */}
        <Container xxl start>
          <Column cozy>
            <DocsHead title={room.title} />
            {/* `font:500 44px/1.05 var(--fd);letter-spacing:-.03em` */}
            <Typography h1>{room.title}</Typography>
            {/* `font:400 22px/1.3 var(--fd);letter-spacing:-.015em;color:var(--tx)` */}
            <Typography tagline>{room.lead}</Typography>
            {/* `font:400 17px/1.55 var(--ft);color:var(--tx2)` */}
            {room.body ? <Typography sectionLead><InlineMarkdown text={room.body} sectionLead /></Typography> : null}
          </Column>
        </Container>
      </Column>
      <Column span={6}>{vignette}</Column>
    </Row>
  );
}

/**
 * The hand-off's stage height (canvas-hero.js `.st{...height:300px...}`, a border box: its
 * 1 px hairline is inside the 300), so the well inside the Card's hairline is the rest.
 */
const STAGE_HEIGHT = 300;
const STAGE_WELL_HEIGHT = STAGE_HEIGHT - 2 * CARD_BORDER;

/**
 * The stage's ground (canvas-hero.js `.st` and `.st::before`), the one docs-only brand
 * illustration the rules allow: over the card's own fill, the accent's soft wash blooming
 * from the top right (`radial-gradient(120% 90% at 85% 0%,var(--ion-soft),transparent 60%)`)
 * and the brand cyan at 12% from the bottom left (`radial-gradient(90% 80% at 0% 100%,
 * color-mix(in oklch,var(--cyan) 12%,transparent),transparent 60%)`), then 1 px dots of the
 * `border` colour on an 18 px grid fading out downward (`radial-gradient(var(--ln) 1px,
 * transparent 1px)` at `18px 18px` under `mask-image:linear-gradient(180deg,#000,transparent)`).
 * One SVG paints it on every platform; it fills the stage under the composition and takes
 * no touches. The ellipses are the unit circle scaled to the hand-off's radii about their
 * centre, in the box's own units.
 */
function StageGround() {
  const { tokens, scheme } = useTheme();
  const id = `stage${useId().replace(/[^A-Za-z0-9]/g, "")}`;
  // The hand-off's `--cyan` (the brand's fixed second hue) and `--ion-soft` (the accent at
  // its scheme's soft alpha).
  const cyan = tokens["promo-middle"] ?? tokens["chart-2"];
  return (
    <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, pointerEvents: "none" }}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id={`${id}-accent`} cx={0} cy={0} r={1} gradientTransform="translate(0.85 0) scale(1.2 0.9)">
            <Stop offset={0} stopColor={tokens.primary} stopOpacity={ACCENT[scheme].soft} />
            <Stop offset={0.6} stopColor={tokens.primary} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id={`${id}-cyan`} cx={0} cy={0} r={1} gradientTransform="translate(0 1) scale(0.9 0.8)">
            <Stop offset={0} stopColor={cyan} stopOpacity={0.12} />
            <Stop offset={0.6} stopColor={cyan} stopOpacity={0} />
          </RadialGradient>
          <Pattern id={`${id}-dots`} x={0} y={0} width={18} height={18} patternUnits="userSpaceOnUse">
            <Circle cx={9} cy={9} r={1} fill={tokens.border} />
          </Pattern>
          <LinearGradient id={`${id}-fade`} x1={0} y1={0} x2={0} y2={1}>
            <Stop offset={0} stopColor="#ffffff" stopOpacity={1} />
            <Stop offset={1} stopColor="#ffffff" stopOpacity={0} />
          </LinearGradient>
          <Mask id={`${id}-mask`} x={0} y={0} width="100%" height="100%" maskUnits="userSpaceOnUse">
            <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id}-fade)`} />
          </Mask>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id}-accent)`} />
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id}-cyan)`} />
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id}-dots)`} mask={`url(#${id}-mask)`} />
      </Svg>
    </View>
  );
}

/**
 * The vignette's stage (the hand-off's `.st`: `height:300px;border-radius:24px;overflow:hidden;
 * ...border:1px solid var(--ln);box-shadow:var(--sh-md)`): the kit Card at the hero corner
 * with the medium shadow, clipped, its ground painted over the card's fill and its
 * composition centred in the 300 px stage. Its test id is the one hook Lookout's hero
 * routes crop to (lookout.config.ts), the box the hand-off's `<cv-hero>` host draws.
 */
export function VignetteStage({ children, illustration = false }: { children: ReactNode; illustration?: boolean }) {
  return (
    <Card heroCorners heroShadow flush clip testID="section-hero">
      <StageGround />
      <PreviewViewport height={STAGE_WELL_HEIGHT}>
        {illustration ? children : (
          <Column grow padLoose center alignCenter>
            <Container sm>{children}</Container>
          </Column>
        )}
      </PreviewViewport>
    </Card>
  );
}
