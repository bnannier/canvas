import type { ViewStyle } from "react-native";

// The body consumes the same bounded workspace on every stage. Dialog owns the
// fixed header/footer and platform modal treatment; Wizard adds no second surface.
export const bodyScroll: ViewStyle = { flex: 1, minHeight: 0 };
export const bodyContent: ViewStyle = { paddingBottom: 12 };
