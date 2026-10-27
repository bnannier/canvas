import { type ColorTokens, controlRipple } from "../../style/index.js";
import { type BreadcrumbSkin } from "./breadcrumb.shared.js";

// The Breadcrumb skin, the v4 hand-off's trail (its `breadcrumb` renderer in
// tools/v4/handoff/cv-kit-inputs.js). Neither iOS nor Android ships a breadcrumb control
// (PLATFORM-REFERENCES.md: iOS uses the navigation bar's back button, Android the top app
// bar's up navigation), so every platform draws the same trail, in its own face:
//   - the crumbs are 400 13px, the ancestors in `muted-foreground`, the current page in
//     `foreground` at 500;
//   - the separator is a 13px chevron, a "/" or a "·" in `subtle-foreground` (the hand-off's
//     tx3), 8 from the crumbs on either side;
//   - the home affordance is a 14px house glyph in the ancestors' ink.
// Only the press feedback and the touch target stay each platform's own: the web and iOS dim
// a pressed link to 0.7, Android ripples instead; the minimum target is the HIG's 44pt or
// Material's 48dp, which the shell reaches with hitSlop around the text-sized links.

const TYPE = { fontSize: 13, lineHeight: 18, fontWeight: "400" } as const;
const HOME_ICON_SIZE = 14;
const SEPARATOR_ICON_SIZE = 13;

const trail = {
  link: (tokens: ColorTokens) => ({ ...TYPE, color: tokens["muted-foreground"] }),
  current: (tokens: ColorTokens) => ({ ...TYPE, fontWeight: "500" as const, color: tokens.foreground }),
  separator: (tokens: ColorTokens) => ({ ...TYPE, color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] }),
  homeIconSize: HOME_ICON_SIZE,
  separatorIconSize: SEPARATOR_ICON_SIZE,
  gap: 8,
};

export const webSkin: BreadcrumbSkin = {
  ...trail,
  ripple: null,
  pressedOpacity: 0.7,
  // Inert for pointer input; keeps a touch-driven web tap area at the 44px floor.
  minTarget: 44,
};

export const iosSkin: BreadcrumbSkin = {
  ...trail,
  ripple: null,
  pressedOpacity: 0.7,
  // HIG minimum tappable area: 44x44pt.
  minTarget: 44,
};

export const androidSkin: BreadcrumbSkin = {
  ...trail,
  ripple: (tokens: ColorTokens) => controlRipple(tokens),
  pressedOpacity: null,
  // Material 3 accessibility minimum touch target: 48x48dp.
  minTarget: 48,
};
