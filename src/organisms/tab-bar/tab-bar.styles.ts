import { StyleSheet } from "react-native";
import { alpha, type ColorTokens } from "../../style/index.js";
import { type TabBarSkin } from "./tab-bar.shared.js";

// Per-OS TabBar skins. iOS = HIG tab bar; Android = Material 3 navigation bar; web mirrors
// the iOS look (the mobile-web shell adopts the iOS feel). Bar fill + border color and the
// label color are token-driven and applied by the shared shell; the skin carries shape,
// label type, and press feedback.

// iOS HIG tab bar: ~49pt, top hairline, SF ~10pt labels, icon over label, press dim.
export const iosSkin: TabBarSkin = {
  bar: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 6, minHeight: 49 },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, paddingVertical: 4 },
  label: (active) => ({ fontSize: 10, lineHeight: 13, fontWeight: active ? "600" : "500", letterSpacing: -0.2 }),
  ripple: null,
  pressedOpacity: 0.6,
};

// Web tab bar: mirrors the iOS look so the mobile-web nav reads as iOS.
export const webSkin: TabBarSkin = {
  bar: { borderTopWidth: 1, paddingTop: 6, minHeight: 52 },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, paddingVertical: 6 },
  label: (active) => ({ fontSize: 11, lineHeight: 14, fontWeight: active ? "600" : "500", letterSpacing: -0.1 }),
  ripple: null,
  pressedOpacity: 0.7,
};

// Material 3 navigation bar: taller, M3 label type with positive tracking, brand ripple,
// no top hairline (M3 elevates the bar instead).
export const androidSkin: TabBarSkin = {
  bar: { borderTopWidth: 0, paddingTop: 8, minHeight: 64 },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 10 },
  label: (active) => ({ fontSize: 12, lineHeight: 16, fontWeight: active ? "600" : "500", letterSpacing: 0.5 }),
  ripple: (t: ColorTokens) => ({ color: alpha(t.primary, 0.12), borderless: true, radius: 36 }),
  pressedOpacity: null,
};
