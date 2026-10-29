import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { View, Pressable, Text, StyleSheet, useFillStyle, useTheme, useLayoutAxis, useReducedMotion, surfaceRipple, pressDim, RippleClip, cornerRadii, splitElevation, devWarn, GlassSurface, GlassPane, paneStyle, paneRipple, legibleWash, isGlass, withInnerFill, LayoutAxisProvider, columnAxis, type StyleProp, type ViewStyle, type TextStyle, type LayoutStyle } from "../../style/index.js";
import { MaterialBehind } from "../../style/glass-surface/material-behind.js";
import { RAISED, liftStyle, useHover, useRaiseCell, useSettling } from "../../style/hover.js";
import { selectedCard } from "../../style/selected-card.js";
import { createBrandCard, brandCardModeOf } from "./card.brand.js";
import { ReferenceCard, referenceModeOf } from "./card.reference.js";
import { Image } from "../../atoms/image/image.shared.js";
import { Badge } from "../../atoms/badge/badge.js";
import { MONO_FONT } from "../../style/mono.js";
import { imageLabel } from "../../atoms/image/image.accessibility.js";
import * as s from "./card.styles.js";
import { type CardSkin, type Corner, type Elevation, type Density, type MediaWell } from "./card.styles.js";

// Shared Card shell. The structure (a surface giving you border, radius, and
// shadow, composed from the subcomponents below), the boolean-prop axes, the
// children-vs-string content logic, and the semantic colors all live here once; a
// platform file supplies only its skin (radius, elevation, the card's own density
// padding) and calls createCard.
//
// Card is a "Light" platform treatment: one structure and one set of (semantic)
// colors, with per-OS touches limited to the corner radius (+ the iOS continuous
// corner curve), the surface's border-vs-elevation treatment (Android's M3
// elevated default hides the outline), the card's own content density, the
// resting elevation, and the press feedback (Android android_ripple, iOS/web
// pressed opacity). The composition subcomponents are static and shared.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf). Axes:
//
// - Elevation (pick one): `raised` > `flat` > `sunken` > `outlined` > `heroShadow` >
//   default. `flat` drops the shadow and steps the fill up a surface; `sunken` drops the
//   shadow and sinks the fill to the well beneath the page (`surface-sunken`, the
//   hand-off's `--bg2` tiles and stages) under the hairline; `outlined` drops the shadow and
//   keeps the card fill under the hairline (the v4 hand-off component page's cards,
//   `background:var(--sf);border:1px solid var(--ln)` with no box-shadow); `heroShadow`
//   is the medium step (the hand-off's `--sh-md`, its section hero's stage), between the
//   resting card and the raised one; `raised` lifts it. (The exact shadow per step is
//   per-OS via the skin.)
// - Corners (pick one): `smallCorners` > `calloutCorners` > `largeCorners` >
//   `stageCorners` > `showcaseCorners` > `heroCorners` > default, the smaller winning.
//   Each is a step of the skin's `corners` table (the web row's tile, callout, panel,
//   stage, showcase-card and hero-stage corners; the native skins keep their own card
//   corner on every step but the tile).
// - Interaction: pass `onPress` to make the whole card pressable; it gains the
//   pressed affordance (Android ripple, iOS/web pressed dim) and the button role,
//   and on the web the hover lift (the skin's `hover`).
// - Padding: a card with raw children pads its surface by DEFAULT (the common
//   case, so a bare `<Card>content</Card>` reads right without ceremony), and the
//   padded surface also SPACES its flat children (padding implies gap: the card
//   owns the rhythm, so a stack of Typography lines needs no layout wrapper).
//   `flush` removes both the inset and the gap for edge-to-edge content (a table,
//   a nav bar) or when you compose CardHeader/CardContent, which carry their own
//   padding. `padded` is the explicit form of the default. The data-driven string-prop path renders
//   self-padding sections, so the surface itself NEVER pads there: `padded` and
//   the density booleans are inert for the inset in that path (adding it would
//   double-pad the sections).
// - Density (pick one): `compact` > `comfortable`. Sets the card's own content
//   padding and the gap between flat children, tight (compact) or roomy
//   (comfortable). A density prop pads the surface on its own, so it needs no
//   `padded`, and it wins over `padded` and `flush` when both are set. On a SECTIONED
//   card (an eyebrow, a title or a footer) the surface never pads, so a density moves
//   its inset and rhythm onto the sections instead (`sectionInsets` in card.styles.ts).
//
// For the docs playground, which maps plain state to props (no JSX children),
// Card also accepts simple string props (title, description, body, footer):
// when no children are passed it renders the header/body/footer structure from
// those strings, so a representative card can be produced from flat state.

export type { CardSkin } from "./card.styles.js";

// The header's internal layout: icon and title on one side, actions opposite.
// Pure composition, identical on every platform, so it stays out of the skins.
const headerStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  main: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  text: { flex: 1 },
  stack: { gap: 4 },
});

export interface CardProps {
  /** Original illustrated approval banner. */
  featured?: boolean;
  /** Show only the authored artwork, filling bounds supplied by the parent. */
  artwork?: boolean;
  /** Inset an illustration in authored artwork. */
  illustration?: boolean;
  controls?: boolean;
  /** Original promotional gradient card. */
  promo?: boolean;
  /** Stack the featured illustration above its content. */
  stacked?: boolean;
  hue?: number;
  initials?: string;
  eyebrow?: string;
  badge?: string;
  caption?: string;
  metadata?: string;
  /** A compact unframed reference summary in a row. */
  referenceInline?: boolean;
  /** A reference key/status row above its summary. */
  referenceStacked?: boolean;
  /** A compact inset reference panel. */
  referenceTile?: boolean;
  /** A roomy reference panel with context and source. */
  referenceDetail?: boolean;
  referenceKey?: string;
  referenceSource?: string;
  /** Open the reference through the system browser. */
  href?: string;
  children?: ReactNode;
  // Simple content props for the children-less / data-driven case.
  title?: string;
  /**
   * A glyph rendered before the title, for a section panel that names itself
   * with an icon. Takes effect on the data-driven path (a card given `title`
   * rather than raw children).
   */
  icon?: ReactNode;
  /**
   * Trailing header content, typically a button. Sits opposite the title so the
   * header reads as one row: name on the left, action on the right.
   */
  actions?: ReactNode;
  description?: string;
  body?: string;
  footer?: string;
  // Elevation (pick one; default is a soft resting shadow).
  raised?: boolean;
  flat?: boolean;
  /**
   * The sunken well: the `surface-sunken` fill under the hairline with no shadow, the
   * hand-off's `--bg2` tiles, stages and panels set into a card.
   * <!-- only: web android -->
   * On Android it is the Material 3 filled card (the well's fill, no outline).
   * <!-- /only -->
   */
  sunken?: boolean;
  /** The hairline on the card fill with no shadow (the hand-off component page's cards). */
  outlined?: boolean;
  /**
   * The section hero's stage shadow: the medium step of the ladder (the hand-off's
   * `--sh-md`, canvas-hero.js `.st`), between the resting card and the raised one.
   */
  heroShadow?: boolean;
  /**
   * An elevation sample: an empty card 72 px tall on the popover fill (the hand-off's
   * `--sf2`) that shows the elevation it is given, its edge the field border at the
   * `heroShadow` and `raised` steps (the Foundations page's depth tiles). Composes with
   * the elevation and corner axes; it takes no children.
   */
  sample?: boolean;
  /**
   * The card floats over the page: under glass on the web it takes the floating material
   * (the functional layer's tint over the backdrop blur, design-language item 7), where a
   * resting card keeps its solid skin. Native glass and solid mode are unchanged.
   */
  floating?: boolean;
  // Padding (orthogonal booleans). A card with raw children is padded by default,
  // and the data-driven string path (no children) pads through its self-padding
  // sections instead, so neither prop moves the surface inset there.
  // `flush` strips the raw-children inset (edge-to-edge content, or composing the self-padding CardHeader/CardContent); `padded` is the explicit form of the padded-by-default.
  padded?: boolean;
  flush?: boolean;
  /** When set, the whole card becomes pressable (a card that behaves as a control). */
  onPress?: () => void;
  /** A clickable container whose nested controls keep their own button/link roles. */
  interactiveContents?: boolean;
  /** Keep the resting opacity while pressed; hover lift and native ripple remain. */
  steadyPress?: boolean;
  /**
   * Active/selected surface: a primary border and a soft primary tint. For
   * selectable cards (a card-style radio or checkbox option that is chosen).
   */
  selected?: boolean;
  /**
   * Grow to fill the main axis of a parent Row/Column (flexGrow: 1). On a card
   * that renders sections, the BODY takes up whatever slack the growth won, so
   * the content region fills the taller surface and a footer stays on its floor
   * rather than floating up under the content. Implied inside a Grid cell: the
   * grid stretches its cells to the row's height and the card fills that box,
   * so the tiles of one row are equal-height without being asked.
   */
  grow?: boolean;
  // Density (pick one; default is the standard inset). Scales the card's own
  // content padding and the gap between flat children.
  compact?: boolean;
  comfortable?: boolean;
  /** Gap-free content densities, tightest first in precedence. */
  dense?: boolean;
  snug?: boolean;
  cozy?: boolean;
  relaxed?: boolean;
  /**
   * The showcase card's density: a 24 px inset with a 20 px rhythm between flat children
   * (the hand-off's section page card). Unlike the other named densities it keeps the gap.
   */
  roomy?: boolean;
  spacious?: boolean;
  insetContent?: boolean;
  rail?: boolean;
  summary?: boolean;
  metric?: boolean;
  request?: boolean;
  menu?: boolean;
  /** A section panel: an 18 px inset with a 12 px rhythm (the hand-off's accessibility cards and anatomy legend). */
  panel?: boolean;
  /** A guidance card: 18 by 20 with a 10 px rhythm (the hand-off's usage guidance and "From the docs" cards). */
  guide?: boolean;
  /** A link tile: 14 by 16 with a 6 px rhythm (the hand-off's related-component tiles). */
  linkTile?: boolean;
  /** A well: a 16 px inset with a 12 px rhythm (the section pages' skeleton card and wizard preview). */
  well?: boolean;
  /** A pager card: 16 by 18 with a 4 px rhythm (the hand-off's previous and next cards). */
  pager?: boolean;
  /** Keep the reference inset without the compact density's flat-child gap. */
  gapless?: boolean;
  borderless?: boolean;
  // Corners (pick one; default is the card corner). The smaller step wins.
  /** The tile corner. */
  smallCorners?: boolean;
  /** The callout corner (14 on the web): a note under a table, a compact link tile. */
  calloutCorners?: boolean;
  /** The section panel corner (18 on the web): a card framing a section of a page. */
  largeCorners?: boolean;
  /** The stage corner (20 on the web): a staging frame, a figure and its legend. */
  stageCorners?: boolean;
  /** The showcase card's corner (20 on the web): the v4 section page's card. */
  showcaseCorners?: boolean;
  /** The hero stage's corner (24 on the web): the v4 section hero's stage (`.st`). */
  heroCorners?: boolean;
  inset?: boolean;
  /** Original inset human-gate content panel. */
  gatePanel?: boolean;
  /** Original compact version-history row. */
  versionPanel?: boolean;
  /** Original inset metric-tool note. */
  notePanel?: boolean;
  dimmed?: boolean;
  clip?: boolean;
  tileShadow?: boolean;
  rowShadow?: boolean;
  emptyShadow?: boolean;
  accessibilityLabel?: string;
  /** Reference harness: hold the existing hover lift. */
  testOnly_hovered?: boolean;
  onLiftChange?: (raised: boolean) => void;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

export function panelOf(p: CardProps) {
  if (p.notePanel) return "note";
  if (p.versionPanel) return "version";
  if (p.gatePanel) return "gate";
  return null;
}

// Elevation precedence when more than one is passed: first match wins.
export function elevationOf(p: CardProps): Elevation {
  if (p.raised) return "raised";
  if (p.flat) return "flat";
  if (p.sunken) return "sunken";
  if (p.outlined) return "outlined";
  if (p.heroShadow) return "hero";
  if (p.tileShadow) return "tile";
  if (p.rowShadow) return "row";
  if (p.emptyShadow) return "empty";
  return "default";
}

// Density precedence when more than one is passed: first match wins.
export function densityOf(p: CardProps): Density {
  if (p.dense) return "dense";
  if (p.snug) return "snug";
  if (p.cozy) return "cozy";
  if (p.relaxed) return "relaxed";
  if (p.roomy) return "roomy";
  if (p.spacious) return "spacious";
  if (p.insetContent) return "insetContent";
  if (p.rail) return "rail";
  if (p.summary) return "summary";
  if (p.metric) return "metric";
  if (p.request) return "request";
  if (p.menu) return "menu";
  if (p.panel) return "panel";
  if (p.guide) return "guide";
  if (p.linkTile) return "linkTile";
  if (p.pager) return "pager";
  if (p.well) return "well";
  if (p.compact) return "compact";
  if (p.comfortable) return "comfortable";
  return "default";
}

// Corner precedence when more than one is passed: the smaller step wins (the component
// page's stage and the section page's showcase card are both 20 on the web; the stage,
// the earlier step, wins the tie).
export function cornerOf(p: CardProps): Corner {
  if (p.smallCorners) return "small";
  if (p.calloutCorners) return "callout";
  if (p.largeCorners) return "large";
  if (p.stageCorners) return "stage";
  if (p.showcaseCorners) return "showcase";
  if (p.heroCorners) return "hero";
  return "default";
}

/**
 * The corner step the nearest Card draws, for the parts that nest inside its corner
 * (CardMedia's top corners sit inside the card's border): a `stageCorners` card's media
 * rounds inside the stage corner, not the default card corner. Outside a Card the media
 * takes the skin's default corner.
 */
const CardCornerContext = createContext<Corner>("default");

export function createCard(skin: CardSkin) {
  // The featured, promotional and artwork modes, at this skin's corner and title face.
  const BrandCard = createBrandCard(skin);
  return function Card(props: CardProps) {
    const { children, title, icon, actions, description, body, footer, flush, onPress, selected, testID, style, onLiftChange } = props;
    const floating = !!props.floating;
    const theme = useMaterialTheme({ static: true, floating, layer: floating ? "functional" : "content" });
    const { tokens } = theme;
    // Under glass the card is a CONTENT-layer pane: GlassSurface strips the skin's fill
    // and hairline and lays the content tint + material behind the sections (see the
    // layered glass model in src/style/tokens.ts). Solid mode keeps the plain View.
    const panel = panelOf(props);
    const elev = panel ? "flat" : elevationOf(props);
    const dens = densityOf(props);
    // A tile-grid cell is a definite box on both axes (the grid stretches it to
    // its row's height), so a card in one grows to fill it without `grow`: the
    // tiles of a row share a flush bottom edge, CSS Grid's default. Anywhere
    // else the card is as tall as its sections unless asked to grow.
    const cell = useLayoutAxis();
    const grow = !!props.grow || cell?.bounded === true;
    // A Card is FILL (src/style/sizing.ts): it spans the parent it is given, shares a
    // Row with hugging siblings, and takes its measure from a Container step or a
    // Row span rather than a width of its own.
    const widthFill = useFillStyle("Card");
    // Hover, read on the pressable card's wrapper (which never moves) for the skin's lift.
    const { hovered: pointerHovered, target: hoverTarget } = useHover(skin.hover != null && onPress != null);
    const pointerOver = props.testOnly_hovered ?? pointerHovered;
    const reduced = useReducedMotion();
    // While it lifts and settles the card stacks above its neighbours (and lifts its layout
    // cell above the next one), so its deeper shade falls over them, as the reference's does.
    const raised = useSettling(pointerOver, reduced ? 0 : (skin.hover?.motion.duration ?? 0));
    useRaiseCell(raised);
    useEffect(() => { onLiftChange?.(raised); }, [raised, onLiftChange]);

    const reference = referenceModeOf(props);
    if (reference) return <ReferenceCard {...props} mode={reference} hoverEnabled={skin.hover != null} />;
    const brand = brandCardModeOf(props);
    // The brand modes are FILL like every Card: without it a native stage that centres its
    // child sizes a featured card at its copy's full width and clips it.
    if (brand) return <BrandCard {...props} style={[widthFill, style]} mode={brand} hoverEnabled={skin.hover != null} />;

    // Empty strings count as "no content", so a cleared field never renders an empty
    // header, footer, or a stray separator: guard on truthiness rather than null for
    // these display strings.
    const hasTitle = Boolean(title) || Boolean(description) || Boolean(icon) || Boolean(actions);
    // The hand-off's eyebrow row: a tracked mono eyebrow, a badge opposite it.
    const hasEyebrow = Boolean(props.eyebrow) || Boolean(props.badge);
    const hasHeader = hasTitle || hasEyebrow;
    // A card is SECTIONED when it renders one of the self-padding sections, whether its
    // body is raw children or the data-driven `body` string. That is what moves the
    // inset off the surface and onto the sections.
    const hasSections = hasHeader || Boolean(footer);
    // `{cond && <X/>}` collapses to `false`, not null, so a card whose body renders
    // nothing must not hang a divider over an empty content section: the body wrapper
    // and the divider above it key off a RENDERABLE child, mirroring the string path's
    // `hasHeader && body` guard.
    const hasBody = children != null && children !== false;
    // The surface inset belongs to the PLAIN children card alone. Deliberately the
    // looser `!= null` test, so `<Card>{false}</Card>` keeps the standard inset. A
    // plain SINGLE-child card's rendered box is pixel-identical to what it always
    // was (the density gap is inert with one child); a card with several flat
    // children now also gains that gap, the surface's own rhythm.
    const padsSurface = children != null && !hasSections;
    // `padded` moves the SURFACE inset, which a sectioned card never takes (its sections
    // pad themselves, at the standard inset or the density's). Silently ignoring a
    // passed prop is the same class of bug as the dropped header this path fixes, so
    // name it in DEV.
    devWarn(
      hasSections && children != null && Boolean(props.padded),
      "[canvas] <Card title>: `padded` sets the card's own surface inset, which a card with a header or footer never takes (its sections pad themselves); drop `padded`, or pass a density (`compact`, `panel`) to retune the sections' inset.",
    );
    // A density on a sectioned card reshapes its sections (card.styles.ts `sectionInsets`);
    // the default density leaves them at their standard inset.
    const sections = hasSections && dens !== "default" ? s.sectionInsets(skin.density[dens]) : null;

    // Shape: the corner step's radius from the skin's own row; iOS adds Apple's continuous
    // (superellipse) corner curve (an iOS-only RN style prop, omitted entirely on the other skins).
    const corner = cornerOf(props);
    const shape: ViewStyle = { borderRadius: skin.corners[corner], ...(skin.curve ? { borderCurve: skin.curve } : null) };
    // The card's visual box WITHOUT the elevation shadow and WITHOUT outer layout: shape, the
    // per-variant surface colors, density padding, and the selected tint.
    const surface: StyleProp<ViewStyle> = [
      s.cardBase,
      shape,
      // Surface colors per elevation variant: web/iOS always show the Light-
      // treatment hairline; Android paints it transparent on the non-outlined
      // (M3 elevated) variants and shows it only on `flat` (M3 outlined).
      skin.surface(tokens, elev),
      // A flat card steps its fill up a surface where the skin says so (the hand-off's sf2).
      elev === "flat" && skin.flatFill ? { backgroundColor: skin.flatFill(tokens) } : null,
      // The surface inset belongs to the PLAIN card alone: a sectioned card (one
      // carrying a header or footer, whatever its body) renders self-padding
      // sections, so a surface inset there would stack on the sections' own
      // (double-padding). On a plain card the density table is the single source:
      // its default row is the standard padding + flat-child gap (`padded` is the
      // explicit form of that default), a density boolean retunes both and wins
      // over everything, and `flush` opts the default out entirely (neither
      // padding nor gap: edge-to-edge content, or composing the self-padding
      // CardHeader/CardContent).
      padsSurface ? (dens === "default" && flush ? null : skin.density[dens]) : null,
      // Selected: recolor the border to primary and wash the surface with a soft
      // primary tint (the border width is unchanged, so content never shifts; on
      // Android's elevated default the resting hairline is transparent, so this
      // paints it in).
      props.borderless ? { borderWidth: 0 } : null,
      props.gapless ? { gap: 0 } : null,
      props.inset ? { backgroundColor: tokens.secondary } : null,
      props.dimmed ? { opacity: 0.75 } : null,
      props.clip ? { overflow: "hidden" } : null,
      selected ? selectedCard(tokens) : null,
      panel ? s.insetPanel(panel, tokens) : null,
      props.sample ? s.sampleSurface(tokens, elev) : null,
    ];
    // Under glass the selection is the primary border, kept over the material as a state
    // border, over the selection wash: the same soft primary tint as in solid, capped where
    // the card's ink would lose 4.5:1.
    const selectionWash = selected ? legibleWash(theme, "selection", { layer: "content" }) : undefined;
    // A card told to GROW fills the box its parent hands it, at every level of its own
    // anatomy: the outermost node grows into the parent's box, a pressable card's Pressable
    // (the node that draws the surface) fills the RippleClip wrapper around it, and the
    // BODY takes up the slack inside the surface. Without the last the sections stack from
    // the top and every extra pixel piles up under the last one, so a card stretched to
    // match a taller neighbour shows its content in a box it does not fill and floats its
    // footer in the middle of the surface; without the middle one the wrapper grows while
    // the visible card stays content-height. Each is inert on a card that is already exactly
    // as tall as its sections, which is every card that was not asked to grow.
    const fill: ViewStyle | null = grow ? { flexGrow: 1 } : null;
    // Outer layout composition, carried on the outermost node (the plain View, or the
    // RippleClip wrapper on a pressable card): the FILL width, the height growth, then
    // the caller's composition.
    const outer: StyleProp<ViewStyle> = [widthFill, fill, style];
    const bodyFill: StyleProp<ViewStyle> = fill;

    // The header and footer are the same nodes on both paths, so they are built once
    // here rather than inside the string-body branch. That is the whole fix: a card
    // given children used to short-circuit to `inner = children`, silently dropping
    // title / icon / actions / description / footer. A section panel needs a titled
    // header AND arbitrary children (a table, a form), which the string `body` cannot
    // express.
    const eyebrowNode = hasEyebrow ? (
      <View style={[s.eyebrowRow, sections?.eyebrow]}>
        {props.eyebrow ? <Text style={[s.eyebrow(tokens), { fontFamily: MONO_FONT }]}>{props.eyebrow}</Text> : <View />}
        {props.badge ? <Badge secondary mono small>{props.badge}</Badge> : null}
      </View>
    ) : null;
    // The body's section inset: a density's, below a header or leading the card; none at
    // the default density, where the section pads itself.
    const bodyInset = sections ? (hasHeader ? sections.contentBelow : sections.content) : null;
    const headerNode = hasHeader ? (
      <>
        {eyebrowNode}
        {hasTitle ? (
          // Below an eyebrow row the title keeps the card's 12px rhythm, not a second inset.
          <CardHeader style={sections ? (hasEyebrow ? sections.headerBelow : sections.header) : hasEyebrow ? { paddingTop: 12 } : undefined}>
            <View style={headerStyles.row}>
              <View style={headerStyles.main}>
                {icon}
                <View style={[headerStyles.text, headerStyles.stack]}>
                  {title ? <Text style={s.title(tokens, skin.titleFont)}>{title}</Text> : null}
                  {description ? <CardDescription>{description}</CardDescription> : null}
                </View>
              </View>
              {actions}
            </View>
          </CardHeader>
        ) : null}
      </>
    ) : null;

    const footerNode = footer ? (
      <>
        <CardSeparator />
        <CardFooter style={sections?.footer}>
          <Text style={s.footerText(tokens)}>{footer}</Text>
        </CardFooter>
      </>
    ) : null;

    let inner: ReactNode;
    if (children != null) {
      // A plain card still renders exactly what the caller passed, byte for byte.
      // A sectioned card wraps those children in the same anatomy the string path
      // uses, so `flush` keeps meaning "run the body edge to edge" rather than
      // silently doing nothing.
      inner = hasSections ? (
        <>
          {headerNode}
          {hasBody ? flush ? children : <CardContent style={[bodyInset, bodyFill]}>{children}</CardContent> : null}
          {footerNode}
        </>
      ) : (
        children
      );
    } else {
      inner = (
        <>
          {headerNode}
          {body ? (
            <CardContent style={[bodyInset, bodyFill]}>
              <Text style={s.bodyText(tokens)}>{body}</Text>
            </CardContent>
          ) : null}
          {footerNode}
        </>
      );
    }

    // A pressable card swaps View for Pressable, adding the pressed affordance:
    // Android gets the surface ripple, iOS/web get the pressed opacity dim.
    if (onPress) {
      // The skin's hover lift: the surface rises inside the wrapper, which is the hover
      // target because it stays put, and takes the hovered elevation in step.
      const hover = skin.hover;
      const hovered = hover != null && pointerOver;
      const shade = hover != null && hover.elevation(elev) !== elev;
      // The bounded ripple is clipped to the rounded card by the RippleClip parent (Android only).
      // A same-node overflow:"hidden" cannot clip it (see src/style/ripple-clip). Because that
      // parent-clip WOULD cut the child's own Android elevation shadow, the Android `elevation`
      // moves onto the wrapper (whose own shadow is drawn around its outline, unclipped) while the
      // iOS `shadow*` stays on the inner node, so iOS is unchanged.
      const { parent: elevParent, child: elevChild } = splitElevation(skin.elevation(hovered ? hover.elevation(elev) : elev, tokens, !!selected));
      const lift = hover != null ? liftStyle(hovered, hover.motion, reduced, shade) : null;
      return (
        <RippleClip shape={cornerRadii(shape)} style={[elevParent, outer, raised ? RAISED : null]} {...hoverTarget}>
          <Pressable
            accessibilityRole={props.interactiveContents ? "none" : "button"}
            accessibilityLabel={props.accessibilityLabel}
            onPress={onPress}
            testID={testID}
            // The card's pane is a child of this Pressable: where it renders, the ripple draws
            // in the foreground, over it (`paneRipple`).
            android_ripple={paneRipple(theme, surfaceRipple(tokens))}
            style={({ pressed }) => [paneStyle(theme, surface, !!selected), elevChild, fill, props.steadyPress ? null : pressDim(pressed), lift]}
          >
            <GlassPane static layer={floating ? "functional" : "content"} floating={floating} shape={surface} stateBorder={!!selected} tint={selectionWash} />
            <MaterialBehind rendered={isGlass(theme)}>
              <CardCornerContext.Provider value={corner}>{inner}</CardCornerContext.Provider>
            </MaterialBehind>
          </Pressable>
        </RippleClip>
      );
    }
    return (
      <GlassSurface static layer={floating ? "functional" : "content"} floating={floating} testID={testID} stateBorder={!!selected} tint={selectionWash} style={[surface, skin.elevation(elev, tokens, !!selected), outer]}>
        <CardCornerContext.Provider value={corner}>{inner}</CardCornerContext.Provider>
      </GlassSurface>
    );
  };
}

export interface CardSectionProps {
  children?: ReactNode;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

export interface CardTextProps {
  children?: ReactNode;
  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<TextStyle>;
}

/** The labeled top of a Card, holding its title and description. */
export function CardHeader({ children, style }: CardSectionProps) {
  return <View style={[s.header, style]}>{children}</View>;
}

/** The Card heading for a skin: the skin supplies the title face. */
export function createCardTitle(skin: Pick<CardSkin, "titleFont">) {
  /** A Card's heading: 500 weight, tight tracking, in the card foreground. */
  return function CardTitle({ children, style }: CardTextProps) {
    const { tokens } = useTheme();
    return <Text style={[s.title(tokens, skin.titleFont), style]}>{children}</Text>;
  };
}

/** The muted supporting line beneath a CardTitle. */
export function CardDescription({ children, style }: CardTextProps) {
  const { tokens } = useTheme();
  return <Text style={[s.description(tokens), style]}>{children}</Text>;
}

export interface CardContentProps extends CardSectionProps {
  /** The tightest inset, 10 x 14: a one-line label under a specimen well. */
  dense?: boolean;
  /** A 12 x 16 inset: a short caption (a title over a meta line). */
  compact?: boolean;
  /** A 14 x 16 inset: a fuller caption (a title, a note, a code line). */
  cozy?: boolean;
}

/** The CardContent density a set of props selects, first match wins: `dense` > `compact` > `cozy`. */
export function contentDensityOf(p: Pick<CardContentProps, "dense" | "compact" | "cozy">): keyof typeof s.contentDensity | null {
  if (p.dense) return "dense";
  if (p.compact) return "compact";
  if (p.cozy) return "cozy";
  return null;
}

/**
 * The body region of a Card. It carries the standard surface padding and the card's
 * flat-child rhythm, so its children space themselves with no wrapper. `dense`, `compact`
 * and `cozy` tighten the inset for a caption under a media well.
 */
export function CardContent({ children, style, ...density }: CardContentProps) {
  const step = contentDensityOf(density);
  return <View style={[s.content, step ? s.contentDensity[step] : null, style]}>{children}</View>;
}

/** The bottom region of a Card, for actions or a summary line. */
export function CardFooter({ children, style }: CardSectionProps) {
  return <View style={[s.footer, style]}>{children}</View>;
}

/**
 * The hairline that anchors a Card's header above its body. A card composing a header and
 * a body keeps this divider between them.
 */
export function CardSeparator({ style }: { style?: StyleProp<ViewStyle> }) {
  const { tokens } = useTheme();
  return <View style={[s.separator(tokens), style]} />;
}

export interface CardMediaProps {
  /** The cover image: a URI string (or a docs sample path), or a bundled `require(...)` asset. */
  src?: string | number;
  /** Height of the image band in px (the image covers it edge to edge). The well that hosts `children` grows with its content instead, from the step its booleans pick. */
  height?: number;
  /** Accessible name / alt text announced for the image. */
  alt?: string;
  /** Accessible name for the image, as `alt` gives; when both are set it wins, as on Image. */
  accessibilityLabel?: string;
  /**
   * Live content to stage in place of an image: CardMedia becomes a sunken well (the
   * page's `surface-sunken` fill, an ink tint under glass) that centers what it holds,
   * a specimen above a caption. Children win over `src` when both are passed.
   */
  children?: ReactNode;
  // Well size (pick one; children only). The default well is 160 px tall at least,
  // with a 28 x 20 inset.
  /** A shorter well: 130 px at least, a 24 x 16 inset (a size or state specimen). */
  compact?: boolean;
  /** A taller well: 240 px at least, a 32 x 20 inset (a platform skin specimen). */
  tall?: boolean;
  /** A figure's stage: 320 px at least, an 80 x 40 inset (an anatomy figure under its marks). */
  stage?: boolean;
  /**
   * A playground's stage: 340 px at least, a 44 x 28 inset, growing to the height and
   * the remaining width of a panel beside it (a live specimen beside its knobs).
   */
  playground?: boolean;
  /** E2E hook forwarded to the image, or to the well. */
  testID?: string;
}

// The layout facts a specimen well publishes: a sized column that centers its children.
const WELL_AXIS = columnAxis(false, null, true);

// The well's size precedence when more than one is passed: first match wins, the
// smaller well over the taller one, the specimen wells over the stages.
export function mediaWellOf(p: Pick<CardMediaProps, "compact" | "tall" | "stage" | "playground">): MediaWell {
  if (p.compact) return "compact";
  if (p.tall) return "tall";
  if (p.stage) return "stage";
  if (p.playground) return "playground";
  return "default";
}

// Media: the full-bleed cover slot at the TOP of a card. Unlike the other anatomy
// subcomponents this one is skin-parameterized, because its top corners must nest
// inside the card's per-OS rounded corner (outer radius minus the 1px border) while
// the bottom edge stays square where the content continues. Compose it with `flush`
// (the card's padding off), then let CardHeader/CardContent pad the text below:
//
//   <Card flush>
//     <CardMedia src="/kira-tanaka.jpg" height={180} alt="…" />
//     <CardContent>…</CardContent>
//   </Card>
//
// Given children it is a specimen well instead (the v4 hand-off's component page
// stages every variant, size, state and platform skin this way): the content centered
// on the sunken fill, at least the well step's height and growing with its content.
// The well is a fill INSIDE the card's pane, so under glass it is an ink tint over the
// material (withInnerFill), never an opaque patch.
export function createCardMedia(skin: CardSkin) {
  return function CardMedia(props: CardMediaProps) {
    const { src, height = 180, alt, accessibilityLabel, children, testID } = props;
    const theme = useMaterialTheme({ static: true });
    // The nested top radius: the corner the card around it draws (its Corners step, the
    // default corner outside a Card) minus the border it sits inside.
    const radius = Math.max(0, skin.corners[useContext(CardCornerContext)] - s.CARD_BORDER);
    const shape = {
      borderTopLeftRadius: radius,
      borderTopRightRadius: radius,
      ...(skin.curve ? { borderCurve: skin.curve } : null),
    };
    if (children != null && children !== false) {
      return (
        <View testID={testID} style={[s.mediaWell[mediaWellOf(props)], shape, withInnerFill(theme, { backgroundColor: theme.tokens["surface-sunken"] ?? theme.tokens.muted }, "soft")]}>
          {/* The well is a bounded column that centers rather than stretches, so a hug
              child (a Button, a Badge) stays centered and a fill child spans it. */}
          <LayoutAxisProvider value={WELL_AXIS}>{children}</LayoutAxisProvider>
        </View>
      );
    }
    return (
      <Image
        source={typeof src === "number" ? src : src ? { uri: src } : undefined}
        width="100%"
        height={height}
        style={shape}
        // Image's own naming order (accessibilityLabel, then alt), handed over as `alt` so
        // the cover stays its own accessibility element natively however it was named.
        alt={imageLabel({ accessibilityLabel, alt })}
        testID={testID}
      />
    );
  };
}
