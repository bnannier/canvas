import { alpha, type ColorTokens } from "../../style/index.js";
import { type ProgressSkin, type Size } from "./progress.shared.js";

// Co-located Progress skins, one per platform, all driven by the brand tokens (passed in
// from useTheme so they follow light/dark). The BRAND survives on every platform: the
// active fill is always the brand `primary`, never a platform default. Only the native
// SHAPE of the bar (track thickness, end radius, and the inactive-track tone) changes per
// OS, matched to each platform's real progress reference:
//
//   iOS (UIProgressView / SwiftUI ProgressView, iOS 27 kit Progress Indicators): a THIN
//     ~4pt track with FULLY ROUNDED ends (radius = height/2 → a capsule). The inactive
//     track is a faint tint of the fill (~20% primary), the iOS look where the trackTint
//     is a light wash of the progressTint.
//   Android (Material 3 linear progress indicator): a 4dp track, fully rounded ends, with
//     the inactive track on the `secondary`/container tone (more visible than iOS's faint
//     wash). M3 leaves a small gap + stop indicator on the real control; the gap is omitted
//     here to keep one cross-platform structure, but the thickness, rounded ends, and
//     container-toned track match M3.
//   Web: the established Canvas / shadcn look (Radix Progress): an h-2 (8px) FULLY ROUNDED
//     track, `bg-primary/20` inactive track, `bg-primary` fill. Kept verbatim as the
//     web-appropriate default.

// iOS: a thin 4pt bar across all sizes, nudged up/down a hair by the size axis so `small`
// and `large` still read as distinct without ever losing the hairline iOS feel.
const IOS_HEIGHT: Record<Size, number> = { small: 3, base: 4, large: 6 };
// Fully rounded ends (capsule): radius = height / 2.
const IOS_RADIUS: Record<Size, number> = { small: 1.5, base: 2, large: 3 };

// Android (M3): the M3 linear indicator is 4dp; the size axis steps it 3/4/8 so the axis
// is meaningful while the default stays on the M3 4dp spec.
const ANDROID_HEIGHT: Record<Size, number> = { small: 3, base: 4, large: 8 };
// M3 rounds the ends fully (radius = height / 2).
const ANDROID_RADIUS: Record<Size, number> = { small: 1.5, base: 2, large: 4 };

// Web (shadcn/Radix): h-2 (8px) default, fully rounded; the size axis steps the thickness
// while keeping the rounded-full ends.
const WEB_HEIGHT: Record<Size, number> = { small: 6, base: 8, large: 12 };
const WEB_RADIUS: Record<Size, number> = { small: 3, base: 4, large: 6 };

export const iosSkin: ProgressSkin = {
  height: IOS_HEIGHT,
  radius: IOS_RADIUS,
  // iOS trackTint: a faint wash of the progressTint (the fill). ~20% primary reads as the
  // light gray-violet inactive track on a white sheet, and tints correctly in dark.
  trackColor: (t: ColorTokens) => alpha(t.primary, 0.18),
  fillColor: (t: ColorTokens) => t.primary,
  indeterminateWidth: 0.3,
};

export const androidSkin: ProgressSkin = {
  height: ANDROID_HEIGHT,
  radius: ANDROID_RADIUS,
  // M3 inactive track sits on the container tone (more present than iOS's faint wash); the
  // `secondary` token is the closest semantic surface in light and dark.
  trackColor: (t: ColorTokens) => t.secondary,
  fillColor: (t: ColorTokens) => t.primary,
  indeterminateWidth: 0.35,
};

export const webSkin: ProgressSkin = {
  height: WEB_HEIGHT,
  radius: WEB_RADIUS,
  // shadcn: bg-primary/20 track, bg-primary fill.
  trackColor: (t: ColorTokens) => alpha(t.primary, 0.2),
  fillColor: (t: ColorTokens) => t.primary,
  indeterminateWidth: 0.3,
};
