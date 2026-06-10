import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { View, useTheme, type StyleProp, type ViewStyle } from "../../style/index.js";
import * as s from "./skeleton.styles.js";

// Skeleton: muted placeholder blocks shown while content loads. A single shape
// (text line, avatar, button, or a composite card/list/table scaffold) built
// from one muted fill, optionally pulsing. The size axis scales the line height
// and the avatar/button footprint.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf).

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

type Shape = s.Shape;

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

// A single muted line; the building block for text and the composite shapes.
// The muted fill + the line base (`h-3.5 rounded w-full`), then any width/margin
// overrides the caller layers on.
function Line({ animate, style }: { animate?: boolean; style?: StyleProp<ViewStyle> }) {
  const { tokens } = useTheme();
  return <Pulse animate={animate} style={[s.fill(tokens), s.lineBase, style]} />;
}

export function Skeleton(props: SkeletonProps) {
  const { animate, style } = props;
  const { tokens } = useTheme();
  const shape = shapeOf(props);

  if (shape === "avatar") {
    return <Pulse animate={animate} style={[s.fill(tokens), s.avatarSize(props), style]} />;
  }

  if (shape === "button") {
    return <Pulse animate={animate} style={[s.fill(tokens), s.buttonSize(props), style]} />;
  }

  if (shape === "card") {
    return (
      <View style={[s.cardSurface(tokens), style]}>
        <View style={s.cardRow}>
          <Pulse animate={animate} style={[s.fill(tokens), s.cardAvatar]} />
          <View style={s.flexFill}>
            <Line animate={animate} style={s.cardLine70} />
            <Line animate={animate} style={s.cardLine40} />
          </View>
        </View>
        <Line animate={animate} />
        <Line animate={animate} style={s.cardLine80} />
      </View>
    );
  }

  if (shape === "list") {
    const Row = ({ a, b }: { a: StyleProp<ViewStyle>; b: StyleProp<ViewStyle> }) => (
      <View style={s.listRow}>
        <Pulse animate={animate} style={[s.fill(tokens), s.listAvatar]} />
        <View style={s.flexFill}>
          <Line animate={animate} style={[s.listLineGap, a]} />
          <Line animate={animate} style={b} />
        </View>
        <Line animate={animate} style={s.w10} />
      </View>
    );
    return (
      <View style={[s.listContainer, style]}>
        <Row a={{ width: "70%" }} b={{ width: "50%" }} />
        <Row a={{ width: "55%" }} b={{ width: "35%" }} />
      </View>
    );
  }

  if (shape === "table") {
    const Row = ({ a, b, last }: { a: StyleProp<ViewStyle>; b: StyleProp<ViewStyle>; last?: boolean }) => (
      <View style={[s.tableRow, !last ? s.tableDivider(tokens) : null]}>
        <Line animate={animate} style={s.w10} />
        <Line animate={animate} style={[s.flexFill, a]} />
        <Line animate={animate} style={[s.flexFill, b]} />
        <Line animate={animate} style={s.w20} />
      </View>
    );
    return (
      <View style={[s.tableContainer, style]}>
        <Row a={{ width: "70%" }} b={{ width: "50%" }} />
        <Row a={{ width: "80%" }} b={{ width: "60%" }} />
        <Row a={{ width: "65%" }} b={{ width: "45%" }} last />
      </View>
    );
  }

  // Default: a single text line, full width by default; style carries the width
  // override (e.g. width: "60%") and any other layout.
  return <Pulse animate={animate} style={[s.fill(tokens), s.lineHeight(props), s.textBase, style]} />;
}
