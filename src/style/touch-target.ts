import { useState } from "react";
import { Platform, type Insets, type LayoutChangeEvent } from "react-native";

/**
 * Meeting the platform minimum touch target without changing what anything looks like.
 *
 * Apple asks for 44pt and Material 3 for 48dp, and plenty of controls are smaller than
 * that on purpose: a small text button, an icon square, a checkbox, a segmented item.
 * Growing them to the minimum would be the wrong fix, because the minimum is about the
 * area a finger can hit, not the area the design should occupy.
 *
 * So the shape stays and the TOUCH area grows. A skin declares its platform's minimum,
 * the shell measures what the control actually rendered at, and hitSlop makes up the
 * shortfall symmetrically. Nothing moves: hitSlop is not layout. On the web the skins
 * declare no minimum at all, because a pointer target is visual-sized and a mouse does
 * not have a fingertip.
 *
 * The pattern started on Button and lives here so every pressable can use it, and so
 * the coverage test has one thing to look for rather than a family of near-copies.
 */

/** The platform minimums, from the two platforms' own guidance. */
export const TOUCH_TARGET = { ios: 44, android: 48 } as const;

/**
 * The running platform's minimum, for a component that ships ONE shared skin across
 * all three platforms (its look is genuinely platform-neutral, so there is nothing
 * per-OS to declare). A skin object is evaluated once, in the platform's own bundle,
 * so this resolves to that platform's number.
 */
export function platformMinTarget(): number | null {
  if (Platform.OS === "ios") return TOUCH_TARGET.ios;
  if (Platform.OS === "android") return TOUCH_TARGET.android;
  return null;
}

/** Skins that own a pressable declare this: the minimum, or null for none. */
export interface TouchTargetSkin {
  /** iOS 44, Android 48, web null. */
  minTarget: number | null;
}

export interface MinTargetOptions {
  /**
   * Which axes to extend. "both" is the default and is right for a control with space
   * around it. "vertical" is for a control that abuts its siblings horizontally (tabs,
   * breadcrumb links, a segmented track): extending sideways there would overlap the
   * neighbour's slop and make a tap near the seam ambiguous.
   */
  axis?: "both" | "vertical";
}

/**
 * The insets that bring a `width` x `height` control up to `minTarget`, or undefined
 * when it already meets it. Half the shortfall per side, so the control stays centred
 * in its own touch area.
 */
export function minTargetSlop(
  minTarget: number,
  width: number,
  height: number,
  options: MinTargetOptions = {},
): Insets | undefined {
  const h = options.axis === "vertical" ? 0 : Math.max(0, (minTarget - width) / 2);
  const v = Math.max(0, (minTarget - height) / 2);
  return h > 0 || v > 0 ? { top: v, bottom: v, left: h, right: h } : undefined;
}

/**
 * Measure a pressable and extend its touch area to the platform minimum.
 *
 * Spread the result onto the Pressable:
 *
 *   <Pressable {...useMinTargetSlop(skin.minTarget)} onPress={…} />
 *
 * A null minimum (the web skins) returns nothing at all, so the web pays no
 * measurement cost and the Pressable gets no onLayout it does not need.
 */
export function useMinTargetSlop(
  minTarget: number | null,
  options: MinTargetOptions = {},
): { onLayout?: (event: LayoutChangeEvent) => void; hitSlop?: Insets } {
  const [hitSlop, setHitSlop] = useState<Insets | undefined>(undefined);
  const axis = options.axis;
  if (minTarget == null) return {};
  return {
    hitSlop,
    onLayout: (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      const next = minTargetSlop(minTarget, width, height, { axis });
      // Bail out with the SAME reference unless the insets changed: onLayout fires on
      // every layout pass, and a fresh object each time would re-render forever.
      setHitSlop((previous) =>
        previous?.top === next?.top && previous?.left === next?.left ? previous : next,
      );
    },
  };
}
