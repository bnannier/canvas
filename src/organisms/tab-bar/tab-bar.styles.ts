import { StyleSheet } from "react-native";
import { alpha, type ColorTokens, type ViewStyle } from "../../style/index.js";
import { type TabBarSkin } from "./tab-bar.shared.js";

// Per-OS TabBar skins. iOS = HIG tab bar; Android = Material 3 navigation bar; web mirrors
// the iOS look (the mobile-web shell adopts the iOS feel) EXCEPT for the active indicator,
// where it takes M3's pill so a web shell's bar and rail mark the current destination the
// same way; the webSkin note below carries the reasoning. Bar fill + border color and the
// label color are token-driven and applied by the shared shell; the skin carries shape,
// label type, active indicator, and press feedback.

// iOS HIG tab bar: ~49pt, top hairline, SF ~10pt labels, icon over label, press dim.
export const iosSkin: TabBarSkin = {
  bar: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 6, minHeight: 49 },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, paddingVertical: 4 },
  label: (active) => ({ fontSize: 10, lineHeight: 13, fontWeight: active ? "600" : "500", letterSpacing: -0.2 }),
  ripple: null,
  pressedOpacity: 0.6,
  pill: null,
};

// Web tab bar: mirrors the iOS look so the mobile-web nav reads as iOS, with one
// deliberate departure — it takes Material 3's active-indicator pill rather than
// iOS's bare tint.
//
// Web is the one platform where a bottom bar and a nav rail are the SAME app seen
// at two widths: an app shell swaps Sidebar for TabBar across a breakpoint, and the
// user carries the memory of one across the resize. Sidebar marks its active row
// with a filled surface behind the row (sidebar.styles.ts `rowFill`), so a tint-only
// tab bar made "you are here" change species at the breakpoint, which is what a
// consumer's visual audit caught. On iOS and Android that never happens — a phone
// app has no rail to disagree with — so this stays a web departure rather than a
// change to the HIG skin.
//
// The pill is the M3 one by construction (see androidSkin below for the full note on
// the tonal brand tint and why a flat gray cannot carry it), scaled down to the 52pt
// web bar: 48x28 against Android's 56x32, since the web bar is 12pt shorter and its
// glyphs a size smaller.
export const webSkin: TabBarSkin = {
  bar: { borderTopWidth: 1, paddingTop: 6, minHeight: 52 },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, paddingVertical: 6 },
  label: (active) => ({ fontSize: 11, lineHeight: 14, fontWeight: active ? "600" : "500", letterSpacing: -0.1 }),
  ripple: null,
  pressedOpacity: 0.7,
  pill: (t: ColorTokens): ViewStyle => ({
    position: "absolute",
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: alpha(t.primary, 0.16),
  }),
};

// Material 3 navigation bar: taller, M3 label type with positive tracking, brand ripple,
// no top hairline (M3 elevates the bar instead).
export const androidSkin: TabBarSkin = {
  bar: { borderTopWidth: 0, paddingTop: 8, minHeight: 64 },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 10 },
  label: (active) => ({ fontSize: 12, lineHeight: 16, fontWeight: active ? "600" : "500", letterSpacing: 0.5 }),
  ripple: (t: ColorTokens) => ({ color: alpha(t.primary, 0.12), borderless: true, radius: 36 }),
  pressedOpacity: null,
  // M3 active-indicator pill: 56x32dp, fully rounded (16 radius). Fill is a tonal brand
  // tint (alpha(primary, 0.16)) standing in for M3's secondary-container — this shadcn
  // token set has no secondary-container, and the flat `secondary` gray is nearly the bar
  // fill, so it would not read as a pill. It carries NO insets: an absolutely-positioned
  // child with no left/top is placed by the parent's alignItems/justifyContent, so the
  // centering wrapper puts it dead-center behind the icon on native Android AND web alike
  // (percentage left/top + negative margins centered on RN Web but drifted on native).
  pill: (t: ColorTokens): ViewStyle => ({
    position: "absolute",
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: alpha(t.primary, 0.16),
  }),
};
