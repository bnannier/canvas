import { type ViewStyle } from "react-native";
import { type SwitchSkin, type Size } from "./switch.shared.js";

// Co-located Switch styles, one skin per platform, all driven by the brand tokens
// (passed in from useTheme so they follow light/dark). Plain RN style objects, so
// they apply on iOS, Android, and web alike. The on-track is always the brand
// `primary`, never the platform default, so the control reads native but stays yours.

const NATIVE_TRACK: Record<Size, { width: number; height: number }> = {
  small: { width: 44, height: 24 },
  base: { width: 48, height: 28 },
  large: { width: 56, height: 32 },
};

const WEB_TRACK: Record<Size, { width: number; height: number }> = {
  small: { width: 32, height: 20 },
  base: { width: 36, height: 20 },
  large: { width: 44, height: 24 },
};

const WEB_THUMB: Record<Size, number> = { small: 14, base: 16, large: 20 };

const PILL: ViewStyle = { borderRadius: 999, position: "relative" };
const ABS: ViewStyle = { position: "absolute", borderRadius: 999 };
const IOS_SHADOW: ViewStyle = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 2,
  elevation: 2,
};

// iOS (HIG): a solid pill with a near-full white thumb.
export const iosSkin: SwitchSkin = {
  track: (t, checked, size) => ({
    ...PILL,
    width: NATIVE_TRACK[size].width,
    height: NATIVE_TRACK[size].height,
    backgroundColor: checked ? t.primary : t.input,
  }),
  thumb: (_t, checked, size) => {
    const d = NATIVE_TRACK[size].height - 4;
    return { ...ABS, ...IOS_SHADOW, top: 2, width: d, height: d, backgroundColor: "#ffffff", ...(checked ? { right: 2 } : { left: 2 }) };
  },
};

// Material 3: an outlined track with a small dot when off; a filled brand track with
// a larger white thumb when on.
export const androidSkin: SwitchSkin = {
  track: (t, checked, size) => ({
    ...PILL,
    width: NATIVE_TRACK[size].width,
    height: NATIVE_TRACK[size].height,
    ...(checked ? { backgroundColor: t.primary } : { backgroundColor: t.muted, borderWidth: 2, borderColor: t.border }),
  }),
  thumb: (t, checked, size) => {
    const h = NATIVE_TRACK[size].height;
    if (checked) {
      const d = h - 8;
      return { ...ABS, top: (h - d) / 2, right: 4, width: d, height: d, backgroundColor: "#ffffff" };
    }
    const d = Math.round(h / 2.6);
    return { ...ABS, top: (h - 4 - d) / 2, left: 4, width: d, height: d, backgroundColor: t["muted-foreground"] };
  },
};

// Web: the current Canvas look, a compact pill with a surface-colored thumb.
export const webSkin: SwitchSkin = {
  track: (t, checked, size) => ({
    ...PILL,
    width: WEB_TRACK[size].width,
    height: WEB_TRACK[size].height,
    backgroundColor: checked ? t.primary : t.input,
  }),
  thumb: (t, checked, size) => {
    const d = WEB_THUMB[size];
    return { ...ABS, top: 2, width: d, height: d, backgroundColor: t.background, ...(checked ? { right: 2 } : { left: 2 }) };
  },
};
