import { type ViewStyle } from "react-native";
import { type SwitchSkin, type Size } from "./switch.shared.js";

// Co-located Switch styles, one skin per platform, all driven by the brand tokens
// (passed in from useTheme so they follow light/dark). Plain RN style objects, so
// they apply on iOS, Android, and web alike. The on-track is always the brand
// `primary`, never the platform default, so the control reads native but stays yours.

// iOS pill, matched to the iOS 27 UI Kit Toggles symbol: the real UISwitch is a
// ~51:31 (≈1.64) pill, NOT the more-elongated track Canvas used before. Each size
// is brought to that aspect ratio (base 46x28 = 1.643, small 40x24 = 1.667,
// large 52x32 = 1.625).
const IOS_TRACK: Record<Size, { width: number; height: number }> = {
  small: { width: 40, height: 24 },
  base: { width: 46, height: 28 },
  large: { width: 52, height: 32 },
};

// iOS off-track gray. systemGray3 (#c7c7cc light, #48484a dark) is the real
// at-rest track fill; the generic `input` token (#e4e4e7 light) is too washed
// out and reads as disabled on a white card. Dark `input` (#27272a) was already
// acceptable, so dark stays close to it via systemGray3 dark.
const IOS_OFF_TRACK = { light: "#c7c7cc", dark: "#48484a" } as const;

// Material 3 (m3.material.io/components/switch/specs): the switch has a SINGLE
// size, a 52×32dp track. Base is that exact spec; small/large are proportional
// Canvas variants.
const NATIVE_TRACK: Record<Size, { width: number; height: number }> = {
  small: { width: 46, height: 28 },
  base: { width: 52, height: 32 },
  large: { width: 56, height: 34 },
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

// iOS (iOS 27 UI Kit Toggles): a ~1.64 pill with a white rounded-rect CAPSULE
// knob (wider than tall), not a circle. The on-track is the brand `primary`; the
// off-track is systemGray3 (a solid mid-gray), never the washed-out `input`.
// The capsule keeps the ~2pt inset on every side and the soft drop shadow.
//
//   thumb height = track height − 4 (2pt top/bottom inset, preserved)
//   thumb width  > height (the iOS 26/27 capsule), with ~2pt inset on the
//                  active edge so it sits flush like the reference:
//                  base 28w×24h, small 24w×20h, large 34w×28h
//   borderRadius = height / 2 (fully-rounded ends, so it reads as a capsule)
const IOS_THUMB: Record<Size, { width: number; height: number }> = {
  small: { width: 24, height: 20 },
  base: { width: 28, height: 24 },
  large: { width: 34, height: 28 },
};

export const iosSkin: SwitchSkin = {
  track: (t, dark, checked, size) => ({
    ...PILL,
    width: IOS_TRACK[size].width,
    height: IOS_TRACK[size].height,
    backgroundColor: checked ? t.primary : dark ? IOS_OFF_TRACK.dark : IOS_OFF_TRACK.light,
  }),
  thumb: (_t, checked, size) => {
    const { width, height } = IOS_THUMB[size];
    const radius = height / 2;
    return {
      position: "absolute",
      borderRadius: radius,
      ...IOS_SHADOW,
      top: 2,
      width,
      height,
      backgroundColor: "#ffffff",
      ...(checked ? { end: 2 } : { start: 2 }),
    };
  },
};

// Material 3: an outlined track with a small dot when off; a filled brand track with
// a larger white thumb when on.
export const androidSkin: SwitchSkin = {
  track: (t, _dark, checked, size) => ({
    ...PILL,
    width: NATIVE_TRACK[size].width,
    height: NATIVE_TRACK[size].height,
    ...(checked ? { backgroundColor: t.primary } : { backgroundColor: t.muted, borderWidth: 2, borderColor: t.border }),
  }),
  thumb: (t, checked, size) => {
    const h = NATIVE_TRACK[size].height;
    if (checked) {
      // M3 selected handle: 24dp at base (h − 8 = 24 when h = 32).
      const d = h - 8;
      return { ...ABS, top: (h - d) / 2, end: 4, width: d, height: d, backgroundColor: "#ffffff" };
    }
    // M3 unselected handle: 16dp at base (h / 2 = 16 when h = 32), centered.
    const d = h / 2;
    return { ...ABS, top: (h - d) / 2, start: 4, width: d, height: d, backgroundColor: t["muted-foreground"] };
  },
};

// Web: the current Canvas look, a compact pill with a surface-colored thumb.
export const webSkin: SwitchSkin = {
  track: (t, _dark, checked, size) => ({
    ...PILL,
    width: WEB_TRACK[size].width,
    height: WEB_TRACK[size].height,
    backgroundColor: checked ? t.primary : t.input,
  }),
  thumb: (t, checked, size) => {
    const d = WEB_THUMB[size];
    return { ...ABS, top: 2, width: d, height: d, backgroundColor: t.background, ...(checked ? { end: 2 } : { start: 2 }) };
  },
};
