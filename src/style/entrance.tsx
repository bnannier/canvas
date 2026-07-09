// Entrance: a one-shot open animation for glass overlays, so a menu/popover appears
// to pop open FROM the control that triggered it and a dialog scale-fades into place —
// Apple's Liquid Glass "morph between related states". It wraps content in an
// Animated.View OUTSIDE the GlassSurface (the material scales with the card, and
// GlassSurface's public API is untouched), animating only transform + opacity (safe on
// Android's New Architecture, unlike animated layout) as a single spring. It is
// OPEN-ONLY: overlays in the kit unmount synchronously, so there is no exit animation.
//
// Under Reduce Motion the animation is skipped and the final frame renders statically
// (Apple: disable elastic/morph effects when Reduce Motion is on).

import { type ReactNode, useEffect, useRef, useState } from "react";
import { Animated, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import { useReducedMotion, supportsNativeDriver } from "./motion.js";

// Anchored menus pop from 85%; dialog panels ease in from 96% (barely a scale, just a
// settle). The menu spring carries a slight overshoot (the liquid feel); the panel
// spring does not.
const MENU_START_SCALE = 0.85;
const PANEL_START_SCALE = 0.96;
const MENU_SPRING = { stiffness: 550, damping: 38, mass: 1 } as const;
const PANEL_SPRING = { stiffness: 500, damping: 44, mass: 1 } as const;

interface Size {
  width: number;
  height: number;
}

/**
 * The progress=0 translation that pins a corner-anchored surface's top-left corner in
 * place while it scales up from `startScale` about its own center. React Native scales
 * about the center, so the top-left corner would otherwise drift by (w/2, h/2)*(1-scale);
 * translating by the negative pins it, making the surface grow out of the trigger corner.
 * The relationship is linear in progress, so the pin holds exactly through spring overshoot
 * (scale > 1). Exported for unit tests.
 */
export function entranceTranslation(size: Size, startScale: number): { x: number; y: number } {
  const k = 1 - startScale;
  return { x: -(size.width / 2) * k, y: -(size.height / 2) * k };
}

export interface EntranceProps {
  /**
   * Anchored mode: the surface scales up from the trigger's corner (its top-left is
   * pinned). Omit for a dialog-style symmetric scale-fade about the center.
   */
  anchor?: boolean;
  /** Layout/position for the wrapper (a menu's absolute left/top; a dialog's width caps). */
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export function Entrance({ anchor, style, children }: EntranceProps) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;
  // Anchored mode needs the surface's own size to pin the corner; measured from the
  // first layout pass, during which the surface is held invisible (progress 0).
  const [size, setSize] = useState<Size | null>(null);
  const startScale = anchor ? MENU_START_SCALE : PANEL_START_SCALE;

  useEffect(() => {
    if (reduced) {
      // Static final frame: fully visible, no scale/translate (Apple: no morph under
      // Reduce Motion).
      progress.setValue(1);
      return;
    }
    if (anchor && !size) return; // wait for measurement so the corner-pin is exact
    progress.setValue(0);
    Animated.spring(progress, {
      toValue: 1,
      ...(anchor ? MENU_SPRING : PANEL_SPRING),
      useNativeDriver: supportsNativeDriver, // one-shot: native off-thread on iOS/Android, JS on web
    }).start();
  }, [reduced, anchor, size, progress]);

  const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: "clamp" });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [startScale, 1], extrapolate: "extend" });
  const from = anchor && size ? entranceTranslation(size, startScale) : { x: 0, y: 0 };
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [from.x, 0], extrapolate: "extend" });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [from.y, 0], extrapolate: "extend" });

  // Measure once in anchored mode. Transform order [translateX, translateY, scale]:
  // the surface is scaled about its center first, then translated into place (the
  // translate is in the parent's coordinate space), which is what pins the corner.
  const onLayout =
    anchor && !size
      ? (event: LayoutChangeEvent) => {
          const { width, height } = event.nativeEvent.layout;
          setSize({ width, height });
        }
      : undefined;

  return (
    <Animated.View
      style={[style, { opacity, transform: [{ translateX }, { translateY }, { scale }] }]}
      onLayout={onLayout}
    >
      {children}
    </Animated.View>
  );
}
