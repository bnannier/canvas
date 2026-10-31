import { Platform } from "react-native";
import type { ThemeFonts } from "../../style/fonts.js";

export interface WizardTypography {
  /** The reference grid's intrinsic body floor in this platform's face. */
  bodyMinimum: number;
  fonts?: ThemeFonts;
}

// K.def('wizard')'s 1fr min-content column: the longest 14px email, its 26px
// field inset/border and the body's 40px inset, measured in the matching face.
// These are font metrics, not a different workflow control or native shape.
// Only browser previews need explicit native face stacks. A physical device keeps
// its app's configured fonts, or its native default when none were registered.
export const webTypography: WizardTypography = { bodyMinimum: 184 };
export const iosTypography: WizardTypography = {
  bodyMinimum: 200.640625,
  fonts: Platform.select({ web: {
    sans: '-apple-system, "SF Pro Text", system-ui, sans-serif',
    display: '-apple-system, "SF Pro Display", system-ui, sans-serif',
  }, default: undefined }),
};
export const androidTypography: WizardTypography = {
  bodyMinimum: 186,
  fonts: Platform.select({ web: {
    sans: "Roboto, system-ui, sans-serif",
    display: "Roboto, system-ui, sans-serif",
  }, default: undefined }),
};
