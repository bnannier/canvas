import { type ViewStyle } from "react-native";

// A scannable QR code needs dark modules on a light field, so the frame is a fixed
// white card with a quiet-zone of padding regardless of the app's light/dark theme
// (the same reason Apple and Google always present QR codes on white). The module
// and field colors below are therefore fixed, not token-driven.
export const frame: ViewStyle = {
  alignSelf: "flex-start",
  padding: 12,
  borderRadius: 12,
  backgroundColor: "#ffffff",
};

// Near-black modules on a white field: maximum contrast for reliable scanning.
export const MODULE_COLOR = "#0a0a0a";
export const FIELD_COLOR = "#ffffff";
