import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { View, useTheme, type ColorTokens, type StyleProp, type ViewStyle } from "../../style/index.js";

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
  /** Subtle opacity pulse while content loads. */
  animate?: boolean;
  /** Escape hatch for layout/positioning composition (mainly sizing, e.g. width). */
  style?: StyleProp<ViewStyle>;
}

// --- platform-neutral fill + layout fragments -------------------------------

// The muted fill every placeholder shares (was `bg-muted`); a color, so it reads
// the active token and follows light/dark/glass.
function fill(tokens: ColorTokens): ViewStyle {
  return { backgroundColor: tokens.muted };
}

// Line height per size; the default line reads like a single row of text.
// `h-4` -> 16, `h-3` -> 12, `h-3.5` -> 14.
function lineHeight(p: { small?: boolean; large?: boolean }): ViewStyle {
  if (p.large) return { height: 16 };
  if (p.small) return { height: 12 };
  return { height: 14 };
}

// Avatar diameter per size. `w-12 h-12` -> 48, `w-8 h-8` -> 32, `w-10 h-10` -> 40.
function avatarDiameter(p: { small?: boolean; large?: boolean }): number {
  return p.large ? 48 : p.small ? 32 : 40;
}

// Button placeholder footprint per size; mirrors the real control's height.
// `h-12 w-32` -> {48,128}, `h-8 w-20` -> {32,80}, `h-9 w-28` -> {36,112}.
function buttonSize(p: { small?: boolean; large?: boolean }): { height: number; width: number } {
  if (p.large) return { height: 48, width: 128 };
  if (p.small) return { height: 32, width: 80 };
  return { height: 36, width: 112 };
}

// A single muted line base: full width, the default line height (`h-3.5`).
const lineBase: ViewStyle = { height: 14, width: "100%" };

// The card surface (sans radius, which the skin supplies): bordered card fill,
// capped width, padded. `border border-border bg-card max-w-[320px] p-4`.
function cardSurface(tokens: ColorTokens): ViewStyle {
  return { borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, maxWidth: 320, padding: 16 };
}

// The card's identity row (avatar + two lines). `flex-row items-center gap-3 mb-4`.
const cardRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 };

// The card avatar pulse (sans radius). `shrink-0 w-10 h-10`.
const cardAvatar: ViewStyle = { flexShrink: 0, width: 40, height: 40 };

// The flex column holding the avatar's two lines. `flex-1`.
const flexFill: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// Line widths inside the card (`w-[70%]` / `w-[40%]` / `w-[80%]`).
const cardLine70: ViewStyle = { width: "70%" };
const cardLine40: ViewStyle = { width: "40%", marginTop: 6 };
const cardLine80: ViewStyle = { width: "80%", marginTop: 6 };

// The list container. `flex-col gap-4 max-w-[400px]`.
const listContainer: ViewStyle = { flexDirection: "column", gap: 16, maxWidth: 400 };

// A list row. `flex-row items-center gap-3`.
const listRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 12 };

// The list row's avatar pulse (sans radius). `w-8 h-8`.
const listAvatar: ViewStyle = { width: 32, height: 32 };

// The list row's primary line spacing. `mb-1.5`.
const listLineGap: ViewStyle = { marginBottom: 6 };

// The list row's trailing meta line. `w-10`.
const w10: ViewStyle = { width: 40 };

// The table container. `max-w-[560px]`.
const tableContainer: ViewStyle = { maxWidth: 560 };

// A table row. `flex-row items-center gap-3 py-3`.
const tableRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 };

// The hairline divider between table rows (omitted on the last row).
function tableDivider(tokens: ColorTokens): ViewStyle {
  return { borderBottomWidth: 1, borderColor: tokens.border };
}

// The table row's trailing cell line. `w-20`.
const w20: ViewStyle = { width: 80 };

// Shape precedence when more than one is passed: first match wins.
function shapeOf(p: SkeletonProps): Shape {
  if (p.text) return "text";
  if (p.avatar) return "avatar";
  if (p.button) return "button";
  if (p.card) return "card";
  if (p.list) return "list";
  if (p.table) return "table";
  return "text";
}

/** A pulsing or static muted block. The resolved width/height/fill go on the
 *  Animated.View itself so percentage widths resolve against the real parent
 *  (a nested View would collapse `w-[60%]` against an auto-width wrapper). */
function Pulse({ animate, style }: { animate?: boolean; style: StyleProp<ViewStyle> }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animate) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.5, duration: 600, useNativeDriver: false }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animate, opacity]);

  return <Animated.View style={[style, { opacity: animate ? opacity : 1 }]} />;
}

export function createSkeleton(skin: SkeletonSkin) {
  // A single muted line; the building block for text and the composite shapes.
  // The muted fill + the line base (`h-3.5 w-full`) + the skin's line radius, then
  // any width/margin overrides the caller layers on.
  function Line({ animate, style }: { animate?: boolean; style?: StyleProp<ViewStyle> }) {
    const { tokens } = useTheme();
    return <Pulse animate={animate} style={[fill(tokens), lineBase, { borderRadius: skin.lineRadius }, style]} />;
  }

  return function Skeleton(props: SkeletonProps) {
    const { animate, style } = props;
    const { tokens } = useTheme();
    const shape = shapeOf(props);

    if (shape === "avatar") {
      const d = avatarDiameter(props);
      return <Pulse animate={animate} style={[fill(tokens), { width: d, height: d, borderRadius: skin.avatarRadius }, style]} />;
    }

    if (shape === "button") {
      const { height, width } = buttonSize(props);
      return <Pulse animate={animate} style={[fill(tokens), { height, width, borderRadius: skin.buttonRadius }, style]} />;
    }

    if (shape === "card") {
      return (
        <View style={[cardSurface(tokens), { borderRadius: skin.cardRadius }, style]}>
          <View style={cardRow}>
            <Pulse animate={animate} style={[fill(tokens), cardAvatar, { borderRadius: skin.avatarRadius }]} />
            <View style={flexFill}>
              <Line animate={animate} style={cardLine70} />
              <Line animate={animate} style={cardLine40} />
            </View>
          </View>
          <Line animate={animate} />
          <Line animate={animate} style={cardLine80} />
        </View>
      );
    }

    if (shape === "list") {
      const Row = ({ a, b }: { a: StyleProp<ViewStyle>; b: StyleProp<ViewStyle> }) => (
        <View style={listRow}>
          <Pulse animate={animate} style={[fill(tokens), listAvatar, { borderRadius: skin.avatarRadius }]} />
          <View style={flexFill}>
            <Line animate={animate} style={[listLineGap, a]} />
            <Line animate={animate} style={b} />
          </View>
          <Line animate={animate} style={w10} />
        </View>
      );
      return (
        <View style={[listContainer, style]}>
          <Row a={{ width: "70%" }} b={{ width: "50%" }} />
          <Row a={{ width: "55%" }} b={{ width: "35%" }} />
        </View>
      );
    }

    if (shape === "table") {
      const Row = ({ a, b, last }: { a: StyleProp<ViewStyle>; b: StyleProp<ViewStyle>; last?: boolean }) => (
        <View style={[tableRow, !last ? tableDivider(tokens) : null]}>
          <Line animate={animate} style={w10} />
          <Line animate={animate} style={[flexFill, a]} />
          <Line animate={animate} style={[flexFill, b]} />
          <Line animate={animate} style={w20} />
        </View>
      );
      return (
        <View style={[tableContainer, style]}>
          <Row a={{ width: "70%" }} b={{ width: "50%" }} />
          <Row a={{ width: "80%" }} b={{ width: "60%" }} />
          <Row a={{ width: "65%" }} b={{ width: "45%" }} last />
        </View>
      );
    }

    // Default: a single text line, full width by default; style carries the width
    // override (e.g. width: "60%") and any other layout.
    return <Pulse animate={animate} style={[fill(tokens), lineHeight(props), { width: "100%", borderRadius: skin.lineRadius }, style]} />;
  };
}
