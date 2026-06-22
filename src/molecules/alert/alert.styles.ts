import { type ViewStyle, type TextStyle } from "react-native";
import { type AlertSkin } from "./alert.shared.js";

// Per-OS Alert skins. Alert is a "Light" treatment: identical structure and semantic
// colors (those live in alert.shared.tsx); only shape radius, density/spacing, type
// tracking, and dismiss press feedback shift per OS. Neither iOS nor Material 3 ships
// an inline alert banner, so there is no native control to match — the per-OS skins
// keep the web structure and apply only platform conventions:
//   Web: the established Canvas look (shadcn callout banner, lifted verbatim) — 8 radius,
//     1px border, px-4 py-3, gap-3, 14/600 title, 14 body, dismiss press = opacity 0.7.
//   iOS (HIG/SF): a softer iOS corner (10 radius, matching grouped-list / card rounding),
//     SF type with tightened tracking (-0.08 title, -0.08 body), no elevation; press =
//     opacity dim (~0.7) on the dismiss control.
//   Android (Material 3): the M3 medium shape (12 radius), M3 type tracking (+0.1 on the
//     title and body per the M3 type scale), flat (M3 contained banner carries no
//     elevation); the dismiss control gets the brand android_ripple (wired in shared) and
//     stays opaque under it (pressed opacity 1).

// Banner shell + density (the tone fill/border color is supplied by shared).
const CONTAINER: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 12,
  borderWidth: 1,
  paddingHorizontal: 16,
  paddingVertical: 12,
};

// Dismiss control box: -mr-1 -mt-0.5 h-6 w-6 items-center justify-center.
const DISMISS: ViewStyle = {
  marginRight: -4,
  marginTop: -2,
  height: 24,
  width: 24,
  alignItems: "center",
  justifyContent: "center",
};

export const webSkin: AlertSkin = {
  container: { ...CONTAINER, borderRadius: 8 },
  iconType: { fontSize: 16, lineHeight: 20 },
  titleType: { fontSize: 14, lineHeight: 20, fontWeight: "600" },
  bodyType: { fontSize: 14, lineHeight: 20 },
  dismissButton: { ...DISMISS, borderRadius: 6 },
  dismissType: { fontSize: 16, lineHeight: 16 },
  dismissPressedOpacity: 0.7,
};

export const iosSkin: AlertSkin = {
  container: { ...CONTAINER, borderRadius: 10 },
  iconType: { fontSize: 16, lineHeight: 20 },
  titleType: { fontSize: 14, lineHeight: 20, fontWeight: "600", letterSpacing: -0.08 },
  bodyType: { fontSize: 14, lineHeight: 20, letterSpacing: -0.08 },
  dismissButton: { ...DISMISS, borderRadius: 8 },
  dismissType: { fontSize: 16, lineHeight: 16 },
  dismissPressedOpacity: 0.7,
};

export const androidSkin: AlertSkin = {
  container: { ...CONTAINER, borderRadius: 12 },
  iconType: { fontSize: 16, lineHeight: 20 },
  titleType: { fontSize: 14, lineHeight: 20, fontWeight: "600", letterSpacing: 0.1 },
  bodyType: { fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  dismissButton: { ...DISMISS, borderRadius: 12 },
  dismissType: { fontSize: 16, lineHeight: 16 },
  dismissPressedOpacity: 1,
};
