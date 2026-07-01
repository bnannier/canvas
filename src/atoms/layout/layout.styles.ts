import { spacing } from "../../style/index.js";
import { type Gap, type Pad } from "./layout.shared.js";

// Co-located layout scale maps. Row and Column resolve one gap step and one
// optional padding step by first-match precedence (in the shared shell) and read
// the pixel value from here. Both scales map onto the shared spacing tokens, so
// the layout scale stays in lockstep with the rest of the kit's spacing.
//
// Layout is a "Shared" platform treatment: flexbox renders identically on iOS,
// Android, and react-native-web, so iosSkin and androidSkin reference the exact
// same maps as webSkin. The full file structure exists to match the kit's
// platform-skin recipe; the columns are intentionally identical.

export interface FlexSkin {
  /** Gap (space between children) per scale step, in px. */
  gap: Record<Gap, number>;
  /** Padding per scale step, in px. */
  pad: Record<Pad, number>;
}

// Gap scale → spacing tokens: flush 0, tight 4, snug 8, cozy 12, relaxed 16,
// loose 24 (Tailwind steps 0 / 1 / 2 / 3 / 4 / 6).
const gap: Record<Gap, number> = {
  flush: spacing["0"],
  tight: spacing["1"],
  snug: spacing["2"],
  cozy: spacing["3"],
  relaxed: spacing["4"],
  loose: spacing["6"],
};

// Padding scale → spacing tokens: padTight 8, pad 16, padLoose 24.
const pad: Record<Pad, number> = {
  padTight: spacing["2"],
  pad: spacing["4"],
  padLoose: spacing["6"],
};

// Web base skin: the shared spacing scale (identical on every platform).
export const webSkin: FlexSkin = { gap, pad };

// iOS (HIG) and Material 3 skins reference the same scale: flexbox has no native
// per-OS layout control to diverge toward. Keeping them identical is intentional.
export const iosSkin: FlexSkin = webSkin;
export const androidSkin: FlexSkin = webSkin;
