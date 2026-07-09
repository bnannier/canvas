import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, alpha, shadow } from "../../style/index.js";
import { type ToastSkin } from "./toast.shared.js";

// Co-located Toast skins, one per platform, all driven by the brand tokens (passed
// in from useTheme so they follow light/dark and read as glass when the functional
// surface is swapped translucent at the theming level). The capsule is routed
// through GlassSurface by the shell, so each skin supplies the SHAPE/type/feedback
// only; the `backgroundColor: popover` is a fallback GlassSurface overrides with the
// active material. Toast is a "Full" treatment: the BRAND survives on every platform
// (the indigo `primary` action tint, the semantic `success`/`destructive` intents),
// only the native shape, type, and press feedback change per OS:
//
//   iOS (HIG banner): a rounded-16 floating capsule, 15pt medium message over a 13pt
//     secondary description, a brand-tinted action, an x dismiss. Press = opacity dim.
//   Android (Material 3 snackbar): a small-radius (4dp) bar on the INVERSE surface
//     (dark `foreground` capsule with light `background` text in a light theme), 14sp
//     body, the action in the brand tint (M3 puts the action in inversePrimary; the
//     kit keeps the brand), press = ripple. Single dismiss x where provided.
//   Web (sonner): a rounded-12 card with shadow-lg, 14px medium message + 13px muted
//     description, a brand action, an x dismiss. Press = opacity dim.

const ICON_SIZE = 18;
const DISMISS_SIZE = 16;
const MAX_WIDTH = 400;

// The capsule shape shared structure; each platform overrides radius/density.
function capsule(t: ColorTokens, radius: number): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius,
    minHeight: 48,
    maxWidth: MAX_WIDTH,
    backgroundColor: t.popover,
    ...shadow("lg"),
  };
}

const actionButton = (): ViewStyle => ({
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 6,
  // clip the Material ripple to the rounded outline (Android clipToOutline)
  overflow: "hidden",
  alignItems: "center",
  justifyContent: "center",
});

const dismissButton = (): ViewStyle => ({
  width: 24,
  height: 24,
  borderRadius: 12,
  // clip the Material ripple to the rounded outline (Android clipToOutline)
  overflow: "hidden",
  alignItems: "center",
  justifyContent: "center",
});

// ---------- Web: the established Canvas look (sonner-style card) ----------
export const webSkin: ToastSkin = {
  container: (t) => capsule(t, 12),
  iconSize: ICON_SIZE,
  message: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", color: t["popover-foreground"] }),
  description: (t) => ({ fontSize: 13, lineHeight: 18, color: t["muted-foreground"] }),
  actionButton,
  actionLabel: (t) => ({ fontSize: 13, lineHeight: 18, fontWeight: "600", color: t.primary }),
  dismissButton,
  dismissIconSize: DISMISS_SIZE,
  pressedOpacity: 0.6,
  ripple: null,
};

// ---------- iOS (HIG floating banner): a rounded-16 capsule ----------
export const iosSkin: ToastSkin = {
  container: (t) => capsule(t, 16),
  iconSize: ICON_SIZE + 1,
  message: (t) => ({ fontSize: 15, lineHeight: 20, fontWeight: "600", color: t["popover-foreground"] }),
  description: (t) => ({ fontSize: 13, lineHeight: 18, color: t["muted-foreground"] }),
  actionButton,
  actionLabel: (t) => ({ fontSize: 15, lineHeight: 20, fontWeight: "600", color: t.primary }),
  dismissButton,
  dismissIconSize: DISMISS_SIZE,
  pressedOpacity: 0.7,
  ripple: null,
};

// ---------- Android (Material 3 snackbar): a small-radius bar ----------
// M3 snackbars use the INVERSE surface: a dark capsule with light text in a light
// theme (`foreground` bg, `background` text), inverting in dark mode, so the bar
// contrasts with the page. The 4dp corner is M3's extra-small snackbar radius.
export const androidSkin: ToastSkin = {
  container: (t) => ({ ...capsule(t, 4), gap: 8, backgroundColor: t.foreground }),
  iconSize: ICON_SIZE + 2,
  message: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "400", color: t.background }),
  description: (t) => ({ fontSize: 13, lineHeight: 18, color: alpha(t.background, 0.7) }),
  actionButton,
  actionLabel: (t) => ({ fontSize: 14, lineHeight: 20, fontWeight: "500", color: t.primary }),
  dismissButton,
  dismissIconSize: DISMISS_SIZE + 2,
  pressedOpacity: null,
  ripple: (t) => ({ color: alpha(t.foreground, 0.12), borderless: false }),
};
