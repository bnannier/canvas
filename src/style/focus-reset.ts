import { type ViewStyle, type TextStyle } from "react-native";

// Suppress the browser's default focus ring on React Native Web. RNW maps the web-only
// `outline*` keys (which aren't in React Native's style types, hence the cast) to CSS; on
// native they don't exist, so this is a no-op there. Spread onto any focusable control whose
// focus state the kit paints itself (a ring/border/fill), so all platforms agree on the look.
//
// One shared source of truth, used by every field/segment/nav control instead of each
// re-declaring the same cast.
export const FOCUS_RESET = { outlineStyle: "none", outlineWidth: 0 } as unknown as ViewStyle & TextStyle;
