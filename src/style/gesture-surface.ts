import { type ViewStyle } from "react-native";

// Tell the browser not to claim a touch gesture for its own panning and zooming,
// so a two-finger pinch reaches the responder system instead of zooming the whole
// page. RNW maps the web-only `touchAction` key to CSS (it sets it itself on
// ScrollView and Pressable); React Native's ViewStyle does not declare it, hence
// the cast. On native there is no such thing, so this is a no-op there.
//
// One shared source of truth, spread by whichever component owns a gesture,
// exactly as FOCUS_RESET is for the browser's focus ring. Never a call-site
// override: a consumer cannot pass this, only a kit component can apply it.
export const GESTURE_SURFACE = { touchAction: "none" } as unknown as ViewStyle;
