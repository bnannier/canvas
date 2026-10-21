import type { ViewStyle } from "react-native";

// Co-located Wizard skins, one per platform. Wizard draws no surface of its own: Dialog
// owns the fixed header/footer and the platform modal treatment, Steps and Button carry
// the platform controls, and the body consumes the same bounded workspace on every stage.
// What is left to the skin is the scrolled body's inset and the footer's spacing, which
// are the same on every OS; the platform entries inject the native parts.
export interface WizardSkin {
  /** The scrolled body's content inset. */
  bodyContent: ViewStyle;
  /** The footer column: the status row (when space is narrow) over the button row. */
  footer: ViewStyle;
}

// Layout-only and identical across platforms: the body fills the workspace Dialog bounds.
export const bodyScroll: ViewStyle = { flex: 1, minHeight: 0 };

export const webSkin: WizardSkin = {
  bodyContent: { paddingBottom: 12 },
  footer: { gap: 8 },
};
export const iosSkin: WizardSkin = webSkin;
export const androidSkin: WizardSkin = webSkin;
