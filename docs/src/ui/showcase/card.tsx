import type { ReactNode } from "react";
import { useRouter } from "expo-router";
import { Card, Chip, Column, Grid, Icon, Row, Typography, View, useTheme } from "@nannier/canvas";
import { CARD_BORDER } from "../../../../src/molecules/card/card.styles.js";
import { pageRoles } from "../../../../src/style/type-scale.js";
import { getComponent } from "../../core/data/components";
import { showcaseCard } from "../../data/showcase";

// A section page's card (the hand-off's `<div id="c-...">` in `Canvas v4.0.0 <Section>.dc.html`,
// `background:var(--sf);border:1px solid var(--ln);border-radius:20px;box-shadow:var(--sh-sm);
// padding:24px;display:flex;flex-direction:column;gap:20px`): the kit Card at the showcase
// corner (`showcaseCorners`, 20) with the `roomy` density (a 24 px inset, its parts 20 apart),
// the 11 px mono header row (title left, meta right, the `pageLabel` role in the third ink), a row of link chips to the components
// the card shows (the kit's `Chip link`), the live composition, and the mono JSX caption
// pinned to the card's foot (the hand-off's `margin-top:auto`, 400 12px/1.6 mono in --tx3:
// the kit's `cardNote` role). The header and the chips
// come from the hand-off's card manifest (docs/src/data/showcase.ts) by the card's id; a
// prop given here wins. A specimen card (one the hand-off draws with no header row) takes no
// title or meta, so it shows its chips over its body.

/** The route of a component's detail page. */
const componentHref = (slug: string) => `/components/${slug}`;

/** A component chip: a link to the component's page, routed on the client. */
function ComponentChip({ slug }: { slug: string }) {
  const router = useRouter();
  const href = componentHref(slug);
  return (
    <Chip
      link
      href={href}
      onPress={(event) => {
        // The chip is an anchor on the web: route on the client instead of loading the page.
        event?.preventDefault();
        router.push(href as never);
      }}
      trailing={<Icon arrowUpRight size={12} decorative />}
    >
      {getComponent(slug)?.name ?? slug}
    </Chip>
  );
}

/**
 * A stage card (the Overlays page's `c-dialog`, `c-drawer`, `c-alert-dialog`, `c-action-sheet`,
 * `c-popover`, `c-wizard` and `c-command`, decision OD-1): the card IS the stage, `--bg2` under
 * the card's hairline at the showcase corner with no padding and no shadow, its chips in the
 * flow at the top, then the `scene` (faux page and orbs), the optional full-bleed `scrim`, the
 * open overlay, and the caption as the mono label pinned at 16 / 14.
 */
export interface StageSpec {
  /** The stage's fixed height (the hand-off's border box); the overlay layer spreads over it. */
  height?: number;
  /**
   * A centred stage instead (`display:grid;place-items:center`): at least this tall, the
   * chips and the overlay centred in the flow inside `pad` ([vertical, horizontal]). The
   * grid's two auto rows share the free height equally and each item centres in its row,
   * which places them as a column spread `space-around` does: the chips do not sit on the
   * overlay's edge (the 2026-10-29 wizard, whose dialog covered its chip).
   */
  minHeight?: number;
  pad?: [number, number];
  /** The faux page and orbs behind the overlay. */
  scene?: ReactNode;
  /**
   * A growing stage instead: at least `height` tall, the overlay in the flow and stretched
   * over the stage, so an overlay that draws its own dim (an embedded Wizard) covers it and
   * the stage grows when the overlay is taller than the floor (a phone).
   */
  grows?: boolean;
  /** On a fixed stage, the chips centred across the stage at this top instead of in the flow. */
  chipsAt?: number;
  /** The overlay layer's inset on a fixed stage ([top, right, bottom, left]). */
  inset?: [number, number, number, number];
  /** A full-bleed `--scrim` over the scene, for an overlay that draws no dim of its own. */
  scrim?: boolean;
  /** The label in the second ink (`--tx2`) rather than the third. */
  labelSubtle?: boolean;
  /** No pinned label: the stage's composition carries the caption itself. */
  noLabel?: boolean;
}

export interface ShowcaseCardProps {
  /** The hand-off's card id (`c-button`); the card's test id is `showcase-<id>`. */
  id: string;
  /** The header's left label; the manifest's by default. */
  title?: string;
  /** The header's right label; the manifest's by default. */
  meta?: string;
  /** The components the chips link to, by URL slug; the manifest's by default. */
  links?: readonly string[];
  /** The mono line at the card's foot, usually the JSX the card demonstrates. */
  caption?: ReactNode;
  /**
   * The caption in the 11 px `tiny` role instead of the 12 px card note: the Charts page's
   * `font:400 11px/1.5 var(--fm)` foot (15.95 against its 16.5 line, decision 3's residual).
   */
  tinyCaption?: boolean;
  /**
   * The hand-off's split card (`c-chart`): no header row, and the chips take the first cell
   * of a grid whose other cells are the children (each carrying its own header), 320 px
   * tiles 32 apart.
   */
  split?: boolean;
  /** Draw the card as a stage (see StageSpec). */
  stage?: StageSpec;
  children?: ReactNode;
}

/** The stage card's body: chips, scene, scrim, the overlay and the pinned label, in paint order. */
function Stage({ id, spec, chips, caption, children }: { id: string; spec: StageSpec; chips: readonly string[]; caption?: ReactNode; children?: ReactNode }) {
  const { tokens } = useTheme();
  const centred = spec.minHeight != null;
  const inner = (centred ? spec.minHeight! : spec.height ?? 460) - 2 * CARD_BORDER;
  const [padV, padH] = spec.pad ?? [0, 0];
  const inset = spec.inset ?? [0, 0, 0, 0];
  return (
    // A plain Column holds the card so a grid row taller than the stage (a frame card beside
    // it) leaves the stage at its own height, as the hand-off's fixed-height stage does.
    <Column>
    <Card sunken flush clip showcaseCorners testID={`showcase-${id}`}>
      <View
        style={centred
          ? { minHeight: inner, paddingVertical: padV, paddingHorizontal: padH, alignItems: "center", justifyContent: "space-around" }
          : spec.grows ? { minHeight: inner } : { height: inner }}
      >
        {chips.length > 0 ? (
          <View
            style={spec.chipsAt != null
              ? { position: "absolute", top: spec.chipsAt, left: 0, right: 0, alignItems: "center" }
              : { marginTop: -6, alignSelf: centred ? "center" : "flex-start" }}
          >
            <Row wrap compact>
              {chips.map((slug) => <ComponentChip key={slug} slug={slug} />)}
            </Row>
          </View>
        ) : null}
        {spec.scene}
        {spec.scrim ? <View aria-hidden style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: tokens.scrim, pointerEvents: "none" }} /> : null}
        {centred ? children : spec.grows ? <View style={{ flexGrow: 1 }}>{children}</View> : (
          <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, paddingTop: inset[0], paddingRight: inset[1], paddingBottom: inset[2], paddingLeft: inset[3] }}>
            {children}
          </View>
        )}
        {caption != null && !spec.noLabel ? (
          <View style={{ position: "absolute", left: 16, top: 14, right: 16, pointerEvents: "none" }}>
            {spec.labelSubtle ? <Typography pageLabel mono subtle>{caption}</Typography> : <Typography pageLabel mono muted>{caption}</Typography>}
          </View>
        ) : null}
      </View>
    </Card>
    </Column>
  );
}

export function ShowcaseCard({ id, title, meta, links, caption, tinyCaption, split, stage, children }: ShowcaseCardProps) {
  const spec = showcaseCard(id);
  const head = { title: title ?? spec?.title, meta: meta ?? spec?.meta };
  const chips = links ?? spec?.links ?? [];
  if (stage) return <Stage id={id} spec={stage} chips={chips} caption={caption}>{children}</Stage>;
  if (split) {
    return (
      <Card showcaseCorners roomy testID={`showcase-${id}`}>
        <Grid minTileWidth={320} apart>
          <Row wrap compact>
            {chips.map((slug) => <ComponentChip key={slug} slug={slug} />)}
          </Row>
          {children}
        </Grid>
      </Card>
    );
  }
  // The hand-off's own inset and gap for this card (docs/src/data/showcase.ts, derived from
  // its inline style): most cards are 24 and 20, the Charts cards 20 and 14, the Data cards 24
  // and 16, the DataTable card unpadded. The inset is the Card's density; one Column carries the
  // gap between the header, the composition and the caption, from the layout gap scale. The
  // header and the chips sit the card's gap plus the header's own margin apart, less the chip
  // row's `margin-top:-6px` (14 on a 20 card, 8 on a Charts card, 22 on the Form card).
  const header = head.title != null || head.meta != null || chips.length > 0 ? (
    <GapColumn gap={spec?.headGap ?? 14}>
      {head.title != null || head.meta != null ? (
        // Both lines shrink and wrap when the row runs out of room, as the hand-off's
        // flex items do; a React Native box would otherwise keep its text's width.
        // A CSS flex item never shrinks below its longest word (`min-width:auto`), where a
        // React Native box shrinks to nothing and breaks the word ("CANDLESTICKCH ART" at 375).
        // The label is monospaced, so that floor is exact: the longest word's advance.
        <Row between cozy alignStart>
          <Column shrink style={{ minWidth: wordFloor(head.title ?? "") }}><Typography pageLabel mono muted>{head.title ?? ""}</Typography></Column>
          {head.meta != null ? <Column shrink style={{ minWidth: wordFloor(head.meta) }}><Typography pageLabel mono muted right>{head.meta}</Typography></Column> : null}
        </Row>
      ) : null}
      {chips.length > 0 ? (
        <Row wrap compact>
          {chips.map((slug) => <ComponentChip key={slug} slug={slug} />)}
        </Row>
      ) : null}
    </GapColumn>
  ) : null;
  const body = <Column grow spacious>{children}</Column>;
  const foot = caption == null ? null : tinyCaption ? <Typography tiny mono muted>{caption}</Typography> : <Typography cardNote mono>{caption}</Typography>;
  return (
    // The composition takes the slack a grid row hands the card, so the caption sits at the foot.
    <FrameCard inset={spec?.inset ?? 24} testID={`showcase-${id}`}>
      <GapColumn gap={spec?.gap ?? 20} grow>
        {header}
        {spec?.footGap != null && caption != null ? (
          // A caption that pads itself away from the body (the Type card's `padding-top:16px`
          // under its 4 px gap) sits the derived foot gap below it.
          <GapColumn gap={spec.footGap} grow>
            {body}
            {foot}
          </GapColumn>
        ) : (
          <>
            {body}
            {foot}
          </>
        )}
      </GapColumn>
    </FrameCard>
  );
}

/** JetBrains Mono's advance, 600 units of its 1000 em: every glyph is 0.6 em wide. */
const MONO_ADVANCE = 0.6;

/** The header label's longest word, the width a CSS flex item keeps (`min-width:auto`). */
function wordFloor(text: string): number {
  const { fontSize, letterSpacing } = pageRoles.pageLabel;
  const longest = Math.max(0, ...text.split(/\s+/).map((word) => [...word].length));
  return Math.ceil(longest * (fontSize * MONO_ADVANCE + letterSpacing));
}

/** The frame card at the hand-off card's inset: 24 the `roomy` density, 20 the default, 0 flush. */
function FrameCard({ inset, testID, children }: { inset: number; testID: string; children: ReactNode }) {
  switch (inset) {
    case 24: return <Card showcaseCorners roomy grow testID={testID}>{children}</Card>;
    case 20: return <Card showcaseCorners grow testID={testID}>{children}</Card>;
    case 0: return <Card showcaseCorners flush grow testID={testID}>{children}</Card>;
    default: throw new Error(`ShowcaseCard: no Card density for a ${inset} px inset`);
  }
}

/** A Column at one of the hand-off card gaps, as the layout gap step that draws it. */
function GapColumn({ gap, grow, children }: { gap: number; grow?: boolean; children: ReactNode }) {
  switch (gap) {
    case 0: return <Column flush grow={grow}>{children}</Column>;
    case 4: return <Column tight grow={grow}>{children}</Column>;
    case 8: return <Column snug grow={grow}>{children}</Column>;
    case 10: return <Column comfortable grow={grow}>{children}</Column>;
    case 12: return <Column cozy grow={grow}>{children}</Column>;
    case 14: return <Column roomy grow={grow}>{children}</Column>;
    case 16: return <Column relaxed grow={grow}>{children}</Column>;
    case 18: return <Column airy grow={grow}>{children}</Column>;
    case 20: return <Column spacious grow={grow}>{children}</Column>;
    case 22: return <Column generous grow={grow}>{children}</Column>;
    case 24: return <Column loose grow={grow}>{children}</Column>;
    case 26: return <Column section grow={grow}>{children}</Column>;
    case 32: return <Column apart grow={grow}>{children}</Column>;
    default: throw new Error(`ShowcaseCard: no layout gap step for ${gap} px`);
  }
}
