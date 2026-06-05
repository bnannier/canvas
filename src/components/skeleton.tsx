import { useEffect, useRef } from "react";
import { Animated, type ViewStyle } from "react-native";
import { cn } from "../cn.js";
import { Box, useStyles } from "../engine/index.js";

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
  /** Extra utilities, mainly for sizing (e.g. "w-1/2", "w-[120px]"). */
  className?: string;
}

type Shape = "text" | "avatar" | "button" | "card" | "list" | "table";

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

// The muted fill every placeholder shares.
const FILL = "bg-muted";

// Line height per size; the default line reads like a single row of text.
function lineHeight(p: SkeletonProps): string {
  if (p.large) return "h-4";
  if (p.small) return "h-3";
  return "h-3.5";
}

// Avatar diameter per size.
function avatarSize(p: SkeletonProps): string {
  if (p.large) return "w-12 h-12";
  if (p.small) return "w-8 h-8";
  return "w-10 h-10";
}

// Button placeholder footprint per size; mirrors the real control's height.
function buttonSize(p: SkeletonProps): string {
  if (p.large) return "h-12 w-32";
  if (p.small) return "h-8 w-20";
  return "h-9 w-28";
}

/** A pulsing or static muted block. The resolved width/height/fill go on the
 *  Animated.View itself so percentage widths resolve against the real parent
 *  (a nested Box would collapse `w-[60%]` against an auto-width wrapper). */
function Pulse({ animate, className }: { animate?: boolean; className: string }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const resolved = useStyles(className);

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

  return <Animated.View style={[resolved as unknown as ViewStyle, { opacity: animate ? opacity : 1 }]} />;
}

// A single muted line; the building block for text and the composite shapes.
function Line({ animate, className }: { animate?: boolean; className?: string }) {
  return <Pulse animate={animate} className={cn(FILL, "h-3.5 rounded w-full", className)} />;
}

export function Skeleton(props: SkeletonProps) {
  const { animate, className } = props;
  const shape = shapeOf(props);

  if (shape === "avatar") {
    return <Pulse animate={animate} className={cn(FILL, "rounded-full", avatarSize(props), className)} />;
  }

  if (shape === "button") {
    return <Pulse animate={animate} className={cn(FILL, "rounded-md", buttonSize(props), className)} />;
  }

  if (shape === "card") {
    return (
      <Box className={cn("rounded-lg border border-border bg-card max-w-[320px] p-4", className)}>
        <Box className="flex-row items-center gap-3 mb-4">
          <Pulse animate={animate} className={cn(FILL, "shrink-0 rounded-full w-10 h-10")} />
          <Box className="flex-1">
            <Line animate={animate} className="w-[70%]" />
            <Line animate={animate} className="w-[40%] mt-1.5" />
          </Box>
        </Box>
        <Line animate={animate} className="w-full" />
        <Line animate={animate} className="w-[80%] mt-1.5" />
      </Box>
    );
  }

  if (shape === "list") {
    const Row = ({ a, b }: { a: string; b: string }) => (
      <Box className="flex-row items-center gap-3">
        <Pulse animate={animate} className={cn(FILL, "rounded-full w-8 h-8")} />
        <Box className="flex-1">
          <Line animate={animate} className={cn("mb-1.5", a)} />
          <Line animate={animate} className={b} />
        </Box>
        <Line animate={animate} className="w-10" />
      </Box>
    );
    return (
      <Box className={cn("flex-col gap-4 max-w-[400px]", className)}>
        <Row a="w-[70%]" b="w-[50%]" />
        <Row a="w-[55%]" b="w-[35%]" />
      </Box>
    );
  }

  if (shape === "table") {
    const Row = ({ a, b, last }: { a: string; b: string; last?: boolean }) => (
      <Box className={cn("flex-row items-center gap-3 py-3", !last && "border-b border-border")}>
        <Line animate={animate} className="w-10" />
        <Line animate={animate} className={cn("flex-1", a)} />
        <Line animate={animate} className={cn("flex-1", b)} />
        <Line animate={animate} className="w-20" />
      </Box>
    );
    return (
      <Box className={cn("max-w-[560px]", className)}>
        <Row a="w-[70%]" b="w-[50%]" />
        <Row a="w-[80%]" b="w-[60%]" />
        <Row a="w-[65%]" b="w-[45%]" last />
      </Box>
    );
  }

  // Default: a single text line. className carries the width (e.g. "w-[60%]").
  return <Pulse animate={animate} className={cn(FILL, lineHeight(props), "rounded", className ?? "w-full")} />;
}
