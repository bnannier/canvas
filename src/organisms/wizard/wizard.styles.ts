import type { ViewStyle } from "react-native";

// Co-located Wizard skins, one per platform. Wizard draws no surface of its own: Dialog
// owns the fixed header/footer and the platform modal treatment, Steps and Button carry
// the platform controls, and the body consumes the same bounded workspace on every stage.
// What is left to the skin is the scrolled body's inset and the footer's spacing, which
// are the same on every OS; the platform entries inject the native parts.
export interface WizardSkin {
  /** The scrolled body's content inset. */
  bodyContent: ViewStyle;
  /** The fixed workflow step rail. */
  sidebar: ViewStyle;
  /** Back at the start, application actions at the end. */
  footer: ViewStyle;
}

// Layout-only and identical across platforms: the body fills the workspace Dialog bounds.
export const bodyScroll: ViewStyle = { flex: 1, minHeight: 0, minWidth: 0 };
export const actions: ViewStyle = { flexDirection: "row", gap: 8, marginStart: "auto" };

export const webSkin: WizardSkin = {
  bodyContent: { padding: 20, gap: 10 },
  sidebar: { width: 170, flexShrink: 0, padding: 16, borderEndWidth: 1 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
};
export const iosSkin: WizardSkin = webSkin;
export const androidSkin: WizardSkin = webSkin;
