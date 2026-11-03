import { useMaterialTheme } from "../../style/glass-surface/use-material-theme.js";
import { useEffect } from "react";
import { Easing } from "react-native";
import { View, LoopView, createLoopChannel, useReducedMotion, thereAndBack, type ColorTokens, type StyleProp, type ViewStyle, type LayoutStyle, GlassPane, paneStyle, innerFill } from "../../style/index.js";
import { AnatomyScope, useAnatomyPart, type AnatomyTarget } from "../../style/anatomy.js";
import { AVATAR_DIAMETER } from "../avatar/avatar.shared.js";

// Shared Skeleton shell. The structure (a single muted shape — text line, avatar,
// button — or a composite card / list / table scaffold built from one muted fill,
// optionally pulsing), the boolean-prop axes, the size scaling, and the muted-fill
// color logic all live here once; a platform file supplies only its skin (the corner
// radii of the line / button / avatar / card shapes) and calls createSkeleton.
//
// Skeleton is a "Shared" platform treatment: neither iOS nor Material 3 ships a real
// skeleton control (iOS uses redacted placeholder content; M3 documents skeleton
// loaders only as a motion transition pattern), so there is no native shape to match
// and the look is identical on every platform — the iOS and Android skins reference
// the web skin verbatim. The skin still exists so the architecture is uniform across
// the kit.

export type Shape = "text" | "avatar" | "button" | "card" | "list" | "table";

export interface SkeletonSkin {
  /** Corner radius of a single muted line / text placeholder. */
  lineRadius: number;
  /** Corner radius of the button-shaped placeholder. */
  buttonRadius: number;
  /** Corner radius of the avatar placeholder (fully round). */
  avatarRadius: number;
  /** Corner radius of the card scaffold surface. */
  cardRadius: number;
  /** Corner radius of the card scaffold's media block. */
  mediaRadius: number;
}

export interface SkeletonProps {
  // Shape (pick one; default is a single text line).
  text?: boolean;
  avatar?: boolean;
  button?: boolean;
  card?: boolean;
  list?: boolean;
  table?: boolean;
  // Size (pick one). Scales the line height and the avatar/button footprint.
  small?: boolean;
  large?: boolean;
  // Line length (text shape only; pick one; default spans the parent). A paragraph
  // of placeholder lines varies them so the block reads like wrapped prose.
  /** A line that runs most of the way across (80%), a mid-paragraph line. */
  long?: boolean;
  /** A short trailing line (60%), the last line of a paragraph. */
  short?: boolean;
  /** Subtle opacity pulse while content loads. */
  animate?: boolean;
  /**
   * Screen-reader label announced for the loading placeholder. Defaults to
   * "Loading". The placeholder carries a `progressbar` role + busy state so
   * assistive tech announces the pending content (matching Spinner / Progress).
   */
  accessibilityLabel?: string;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /** Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. */
  style?: LayoutStyle;
}

// The accessibility props every Skeleton shape carries on its outermost element so
// the loading state is perceivable. `progressbar` + a busy state match the kit's
// other two loading indicators (Spinner, Progress). The `aria-busy` alias is
// mandatory: react-native-web does not forward accessibilityState to the DOM, so
// without it web screen readers would never hear the busy state. The whole shape
// announces once as a single node: a single shape IS that node, and a composite
// scaffold keeps its inner muted blocks under a hidden wrapper of their own (below).
function loadingA11y(label: string | undefined) {
  return {
    accessibilityRole: "progressbar" as const,
    accessibilityLabel: label ?? "Loading",
    accessibilityState: { busy: true },
    "aria-busy": true,
  };
}

// Hide a composite shape's inner muted blocks from assistive tech: the announcing
// element already carries the loading state once, so the nested fills must not
// surface as anonymous generic nodes. These flags go on an INNER wrapper View around
// the blocks, never on the announcing element itself: react-native-web forwards only
// the `aria-hidden` alias, so an element carrying both would hide its own progressbar
// (and Android's `no-hide-descendants` hides the host node too). Mirrors the kit's
// established decorative-hide pattern (Spinner's visual renderer, breadcrumb,
// input-otp): the native flags plus the `aria-hidden` web alias.
const innerHidden = {
  accessibilityElementsHidden: true,
  importantForAccessibility: "no-hide-descendants" as const,
  "aria-hidden": true,
};

// --- platform-neutral fill + layout fragments -------------------------------

// The muted fill every placeholder shares (was `bg-muted`); a color, so it reads
// the active token and follows light/dark. Under glass it is an ink tint, so a
// placeholder on a glass pane reads as a translucent block over the material rather
// than an opaque patch (the fill the loaded content's own inner fills take).
function fill(theme: Parameters<typeof innerFill>[0]): ViewStyle {
  return { backgroundColor: innerFill(theme, "muted", "soft") };
}

// Line height per size, the hand-off's bar: 10 by default, 8 small, 14 large.
export function lineHeight(p: { small?: boolean; large?: boolean }): ViewStyle {
  if (p.large) return { height: 14 };
  if (p.small) return { height: 8 };
  return { height: 10 };
}

// Avatar diameter: the Avatar's own discs, the default one and the large one large (the
// hand-off draws no smaller avatar placeholder, so `small` keeps the default disc).
export function avatarDiameter(p: { small?: boolean; large?: boolean }): number {
  return AVATAR_DIAMETER[p.large ? "large" : "default"];
}

// Button placeholder footprint per size: the 120px bar at the button's own height.
export function buttonSize(p: { small?: boolean; large?: boolean }): { height: number; width: number } {
  if (p.large) return { height: 48, width: 120 };
  if (p.small) return { height: 32, width: 120 };
  return { height: 40, width: 120 };
}

// A single muted line base: full width, the default bar height.
const lineBase: ViewStyle = { height: 10, width: "100%" };

// The card frame (sans radius, which the skin supplies): a hairline outline around a
// 16px inset with a 10px rhythm, and no fill of its own, as the hand-off draws it. Like
// the real Card it carries no width cap, so the placeholder fills its parent. Under glass
// it takes the CONTENT-layer material the loaded Card takes (a GlassPane behind the node,
// which keeps its loading role and label), so the swap stays seamless there too.
function cardSurface(tokens: ColorTokens): ViewStyle {
  return { borderWidth: 1, borderColor: tokens.border, padding: 16 };
}
const cardColumn: ViewStyle = { gap: 10 };

// The card's media block: full width, 120px tall.
const cardMedia: ViewStyle = { width: "100%", height: 120 };

// The list and table containers: FILL (the parent picks the measure), four rows 14px apart.
const rowsContainer: ViewStyle = { width: "100%", flexShrink: 1, minWidth: 0 };
const rows: ViewStyle = { flexDirection: "column", gap: 14 };

// A list or table row: its blocks 12px apart, vertically centered.
const row: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 12 };

// The list row's avatar (sans radius).
const listAvatar: ViewStyle = { width: 32, height: 32 };

// Shape precedence when more than one is passed: first match wins.
export function shapeOf(p: SkeletonProps): Shape {
  if (p.text) return "text";
  if (p.avatar) return "avatar";
  if (p.button) return "button";
  if (p.card) return "card";
  if (p.list) return "list";
  if (p.table) return "table";
  return "text";
}

// A text line's length: `short` shortens it more than `long` and wins when both are
// passed; the default spans the parent.
export function lengthOf(p: Pick<SkeletonProps, "short" | "long">): "60%" | "80%" | "100%" {
  if (p.short) return "60%";
  if (p.long) return "80%";
  return "100%";
}

// One shimmer for every Skeleton on the screen: 1 -> 0.5 -> 1 per 1.2s, shaped by a
// there-and-back easing on a shared loop channel (src/style/loop.tsx), so sibling
// placeholders breathe together and the frames cost nothing on the JS thread: the native
// driver on iOS and Android, a compositor CSS animation on the web. The channel runs only
// while a shimmering Skeleton is mounted.
const shimmer = createLoopChannel({ period: 1200, shape: thereAndBack(Easing.inOut(Easing.ease)) });
const SHIMMER = { channel: shimmer, inputRange: [0, 1], outputRange: [1, 0.5] };
let shimmering = 0;

/** A pulsing or static muted block. The resolved width/height/fill go on the
 *  view itself so percentage widths resolve against the real parent (a nested View
 *  would collapse `w-[60%]` against an auto-width wrapper). Extra props
 *  (accessibility flags) are spread onto it so a single-shape Skeleton can carry its
 *  loading semantics on this outermost node. */
function Pulse({ animate, style, ...rest }: { animate?: boolean; style: StyleProp<ViewStyle> } & Record<string, unknown>) {
  // The shimmer is decorative, so honor Reduce Motion: hold the placeholder still
  // (the muted shape alone already reads as "loading").
  const reduced = useReducedMotion();
  const active = !!animate && !reduced;

  useEffect(() => {
    if (!active) return;
    if (shimmering++ === 0) shimmer.play();
    return () => {
      if (--shimmering === 0) shimmer.stop();
    };
  }, [active]);

  return active ? <LoopView {...rest} style={style} opacity={SHIMMER} /> : <View {...rest} style={style} />;
}

export function createSkeleton(skin: SkeletonSkin) {
  // A single muted line; the building block for text and the composite shapes.
  // The muted fill + the line base (`h-3.5 w-full`) + the skin's line radius, then
  // any width/margin overrides the caller layers on.
  function Line({ animate, style, part }: { animate?: boolean; style?: StyleProp<ViewStyle>; part?: AnatomyTarget }) {
    const theme = useMaterialTheme({ layer: "content" });
    return <Pulse animate={animate} ref={part?.ref} onLayout={part?.onLayout} style={[fill(theme), lineBase, { borderRadius: skin.lineRadius }, style]} />;
  }

  return function Skeleton(props: SkeletonProps) {
    const { animate, accessibilityLabel, testID, style } = props;
    const theme = useMaterialTheme({ layer: "content" });
    const { tokens } = theme;
    const shape = shapeOf(props);
    const a11y = loadingA11y(accessibilityLabel);
    // The anatomy part a docs AnatomyProvider numbers (src/style/anatomy.tsx): the
    // hand-off's Placeholder block, the first muted block a shape draws.
    const blockPart = useAnatomyPart("Placeholder block");
    const block = { ref: blockPart?.ref, onLayout: blockPart?.onLayout };

    if (shape === "avatar") {
      const d = avatarDiameter(props);
      return <AnatomyScope><Pulse animate={animate} {...a11y} {...block} testID={testID} style={[fill(theme), { width: d, height: d, borderRadius: skin.avatarRadius }, style]} /></AnatomyScope>;
    }

    if (shape === "button") {
      const { height, width } = buttonSize(props);
      return <AnatomyScope><Pulse animate={animate} {...a11y} {...block} testID={testID} style={[fill(theme), { height, width, borderRadius: skin.buttonRadius }, style]} /></AnatomyScope>;
    }

    if (shape === "card") {
      const h = lineHeight(props).height as number;
      return (
        <AnatomyScope>
          <View {...a11y} testID={testID} style={[paneStyle(theme, cardSurface(tokens)), { borderRadius: skin.cardRadius }, style]}>
            <GlassPane layer="content" shape={{ borderRadius: skin.cardRadius }} />
            <View {...innerHidden} style={cardColumn}>
              <Pulse animate={animate} {...block} style={[fill(theme), cardMedia, { borderRadius: skin.mediaRadius }]} />
              <Line animate={animate} style={{ width: "70%", height: h + 4 }} />
              <Line animate={animate} style={{ width: "90%", height: h }} />
            </View>
          </View>
        </AnatomyScope>
      );
    }

    if (shape === "list" || shape === "table") {
      const h = lineHeight(props);
      // A list row: an avatar, a 40% line and a 20% line; a table row: 25%, 20%, 15% and
      // 15% cells, four rows of either.
      const widths: Array<`${number}%`> = shape === "list" ? ["40%", "20%"] : ["25%", "20%", "15%", "15%"];
      // The first row's first block is the numbered Placeholder block.
      return (
        <AnatomyScope>
          <View {...a11y} testID={testID} style={[rowsContainer, style]}>
            <View {...innerHidden} style={rows}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={row}>
                  {shape === "list" ? <Pulse animate={animate} {...(i === 0 ? block : null)} style={[fill(theme), listAvatar, { borderRadius: skin.avatarRadius }]} /> : null}
                  {widths.map((w, j) => <Line key={j} animate={animate} part={i === 0 && j === 0 && shape === "table" ? blockPart : undefined} style={[h, { width: w }]} />)}
                </View>
              ))}
            </View>
          </View>
        </AnatomyScope>
      );
    }

    // Default: a single text line spanning the parent; `long` / `short` shorten it
    // so a stack of lines reads like a wrapped paragraph.
    const length = lengthOf(props);
    return <AnatomyScope><Pulse animate={animate} {...a11y} {...block} testID={testID} style={[fill(theme), lineHeight(props), { width: length, borderRadius: skin.lineRadius }, style]} /></AnatomyScope>;
  };
}
