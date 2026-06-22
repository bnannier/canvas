import { type ColorTokens, alpha, controlRipple } from "../../style/index.js";
import { type BreadcrumbSkin } from "./breadcrumb.shared.js";

// Per-OS Breadcrumb skins. Breadcrumb is a "Light" treatment: identical structure
// and semantic colors (the layout fragments and roles live in breadcrumb.shared.tsx);
// only the label type (tracking/weight) and the link press feedback shift per OS.
//
// Neither iOS nor Android ships a native breadcrumb control (iOS uses the nav-bar
// back button, Android the top app bar's up navigation), so all three platforms
// match Web's Catalyst/shadcn trail (text-sm, muted-foreground links, a font-medium
// foreground current page, a 60%-muted divider) and layer only the platform reading
// conventions on top:
//   - Web keeps the current Canvas look exactly, with an active:opacity-70 link dim.
//   - iOS applies SF-style tightened tracking (-0.08) and the same 0.7 opacity dim.
//   - Android applies Material 3 body/label tracking (+0.1 / +0.5) and a borderless
//     android_ripple on press (no opacity dim, so the ripple is the only signal).
// The brand survives on every platform: links/current stay on the same semantic
// tokens, never a platform default link color.

const SIZE = { fontSize: 14, lineHeight: 20 } as const;
const HOME_ICON_SIZE = 14;

export const webSkin: BreadcrumbSkin = {
  link: (tokens: ColorTokens) => ({ ...SIZE, color: tokens["muted-foreground"] }),
  current: (tokens: ColorTokens) => ({ ...SIZE, fontWeight: "500", color: tokens.foreground }),
  separator: (tokens: ColorTokens) => ({ ...SIZE, color: alpha(tokens["muted-foreground"], 0.6) }),
  ripple: null,
  pressedOpacity: 0.7,
  homeIconSize: HOME_ICON_SIZE,
};

export const iosSkin: BreadcrumbSkin = {
  link: (tokens: ColorTokens) => ({ ...SIZE, letterSpacing: -0.08, color: tokens["muted-foreground"] }),
  current: (tokens: ColorTokens) => ({ ...SIZE, fontWeight: "600", letterSpacing: -0.08, color: tokens.foreground }),
  separator: (tokens: ColorTokens) => ({ ...SIZE, letterSpacing: -0.08, color: alpha(tokens["muted-foreground"], 0.6) }),
  ripple: null,
  pressedOpacity: 0.7,
  homeIconSize: HOME_ICON_SIZE,
};

export const androidSkin: BreadcrumbSkin = {
  link: (tokens: ColorTokens) => ({ ...SIZE, letterSpacing: 0.1, color: tokens["muted-foreground"] }),
  current: (tokens: ColorTokens) => ({ ...SIZE, fontWeight: "500", letterSpacing: 0.1, color: tokens.foreground }),
  separator: (tokens: ColorTokens) => ({ ...SIZE, letterSpacing: 0.5, color: alpha(tokens["muted-foreground"], 0.6) }),
  ripple: (tokens: ColorTokens) => controlRipple(tokens),
  pressedOpacity: null,
  homeIconSize: HOME_ICON_SIZE,
};
