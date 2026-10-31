import { type ViewStyle } from "react-native";
import { customShadow, TOUCH_TARGET, type ColorTokens } from "../../style/index.js";
import { type SwitchSkin, type Size } from "./switch.shared.js";
import { isRTL } from "../../style/rtl.js";

// Co-located Switch skins, one per platform, drawn in the Canvas v4 hand-off's colours
// (tools/v4/handoff/cv-kit-controls.js, its `sw` renderer and the K.PF rows). Plain RN
// style objects, so they apply on iOS, Android, and web alike. A switch is a real control
// on iOS and Android (PLATFORM-REFERENCES.md), so those skins keep the platform's own
// shape; the on track is always the accent (`primary`), never a platform default.
//
//   Web: a 44x26 pill at the base size (0.8x and 1.2x for small and large), a 1px edge,
//     the raised surface with the `input` boundary when off (solved to 3:1, where the
//     hand-off's hairline is about 1.5:1), the accent fill and edge when on, a lit inset
//     top line, a white knob (track height less 4) with a soft drop shadow, inset 2px
//     from the outer edge. Hovering an on switch adds the accent's glow.
//   iOS: the 51x31 UISwitch pill with a 27pt white round knob inset 2pt, the raised
//     surface when off, the accent when on.
//   Android (Material 3): the 52x32dp track with a 2dp outline, the secondary fill and
//     the subtle ink outline with a 16dp subtle knob when off, the accent fill with a
//     24dp knob in the accent's own ink when on.
//   The platform controls come in one size, and so do these two skins: `small` and
//   `large` scale the web track only, as the hand-off's renderer does.

// The hand-off's knob is white on every platform, in either scheme.
const KNOB = "#ffffff";

// The raised surface (the hand-off's --sf4), the off track's fill.
function raised(t: ColorTokens): string {
  return t["surface-raised"] ?? t.secondary;
}

// Fully rounded (9999 clamps to half the shorter side): the pill track and the round knob.
const PILL: ViewStyle = { borderRadius: 9999, position: "relative" };
const ABS: ViewStyle = { position: "absolute", borderRadius: 9999 };

// ---------- Web ----------
// The hand-off scales the base 44x26 track by 0.8 and 1.2 and rounds.
const WEB_TRACK: Record<Size, { width: number; height: number }> = {
  small: { width: 35, height: 21 },
  base: { width: 44, height: 26 },
  large: { width: 53, height: 31 },
};
const WEB_EDGE = 1;
// The lit top line every web track carries, and the knob's drop.
const WEB_TRACK_LIGHT = "inset 0px 1px 0px rgba(255, 255, 255, 0.2)";
const WEB_KNOB_SHADOW: ViewStyle = customShadow({ offsetY: 1, radius: 3, opacity: 0.35 });

export const webSkin: SwitchSkin = {
  // Component.dc.html's navbar setting: the 32 px chip holds a 26×16 track,
  // a 10 px knob and a 12 px trailing label; the ordinary Switch keeps its sizes.
  chip: {
    root: (t) => ({ height: 32, paddingStart: 8, paddingEnd: 12, marginStart: 4, gap: 8, justifyContent: "flex-start", borderRadius: 9999, borderWidth: 1, borderColor: t.border, backgroundColor: t.secondary }),
    track: (t, checked) => ({ ...PILL, width: 26, height: 16, borderWidth: 1, borderColor: t["field-border"] ?? t.border, backgroundColor: checked ? t.primary : raised(t), transitionProperty: "background-color", transitionDuration: "250ms" } as ViewStyle),
    thumb: (_t, checked) => ({
      ...ABS, ...customShadow({ offsetY: 1, radius: 2, opacity: 0.35 }), top: 2, start: 2, width: 10, height: 10, backgroundColor: KNOB,
      transform: [{ translateX: checked ? 10 * (isRTL() ? -1 : 1) : 0 }],
      transitionProperty: "transform", transitionDuration: "350ms", transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
    } as ViewStyle),
    label: (t, checked) => ({ fontSize: 12, lineHeight: 12, color: checked ? t.foreground : t["subtle-foreground"] ?? t["muted-foreground"] }),
  },
  minTarget: null,
  track: (t, _dark, checked, size) => ({
    ...PILL,
    width: WEB_TRACK[size].width,
    height: WEB_TRACK[size].height,
    borderWidth: WEB_EDGE,
    borderColor: checked ? t.primary : t.input,
    backgroundColor: checked ? t.primary : raised(t),
    boxShadow: WEB_TRACK_LIGHT,
  }),
  thumb: (_t, checked, size) => {
    // The knob sits 1px inside the 1px edge: 2px from the track's outer edge on every side.
    const d = WEB_TRACK[size].height - 4;
    // cv-kit-controls.js and Component.dc.html move one knob on the same node:
    // .35 s cubic-bezier(.34,1.56,.64,1), rather than exchanging start/end.
    return {
      ...ABS, ...WEB_KNOB_SHADOW, top: 1, start: 1, width: d, height: d, backgroundColor: KNOB,
      transform: [{ translateX: checked ? (WEB_TRACK[size].width - WEB_TRACK[size].height) * (isRTL() ? -1 : 1) : 0 }],
      transitionProperty: "transform", transitionDuration: "350ms",
      transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
    } as ViewStyle;
  },
  hover: (t, checked) => (checked ? { boxShadow: `${WEB_TRACK_LIGHT}, 0px 0px 16px ${t.glow ?? t.ring}` } : null),
};

// ---------- iOS ----------
// The UISwitch is one size, 51x31 with a 27pt knob.
const IOS_TRACK = { width: 51, height: 31 };
const IOS_KNOB_SHADOW: ViewStyle = customShadow({ offsetY: 3, radius: 8, opacity: 0.15 });

export const iosSkin: SwitchSkin = {
  minTarget: TOUCH_TARGET.ios,
  track: (t, _dark, checked) => ({
    ...PILL,
    width: IOS_TRACK.width,
    height: IOS_TRACK.height,
    backgroundColor: checked ? t.primary : raised(t),
  }),
  thumb: (_t, checked) => {
    const d = IOS_TRACK.height - 4;
    return { ...ABS, ...IOS_KNOB_SHADOW, top: 2, width: d, height: d, backgroundColor: KNOB, ...(checked ? { end: 2 } : { start: 2 }) };
  },
};

// ---------- Android (Material 3) ----------
// m3.material.io/components/switch/specs: a single 52x32dp track.
const ANDROID_TRACK = { width: 52, height: 32 };
const ANDROID_OUTLINE = 2;

export const androidSkin: SwitchSkin = {
  minTarget: TOUCH_TARGET.android,
  track: (t, _dark, checked) => ({
    ...PILL,
    width: ANDROID_TRACK.width,
    height: ANDROID_TRACK.height,
    borderWidth: ANDROID_OUTLINE,
    ...(checked
      ? { backgroundColor: t.primary, borderColor: t.primary }
      : { backgroundColor: t.secondary, borderColor: t["subtle-foreground"] ?? t["muted-foreground"] }),
  }),
  thumb: (t, checked) => {
    // The knob is placed inside the 2dp outline (absolute children sit in the padding box).
    const inner = ANDROID_TRACK.height - ANDROID_OUTLINE * 2;
    if (checked) {
      // M3 selected handle: 24dp at base, 2dp from the outline's inner edge.
      const d = inner - 4;
      return { ...ABS, top: (inner - d) / 2, end: 2, width: d, height: d, backgroundColor: t["primary-foreground"] };
    }
    // M3 unselected handle: 16dp at base, centered, 4dp in from the start.
    const d = ANDROID_TRACK.height / 2;
    return { ...ABS, top: (inner - d) / 2, start: 4, width: d, height: d, backgroundColor: t["subtle-foreground"] ?? t["muted-foreground"] };
  },
};
