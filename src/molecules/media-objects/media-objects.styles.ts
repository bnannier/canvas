import { type ViewStyle } from "react-native";
import { shadow } from "../../style/index.js";
import { type MediaObjectSkin } from "./media-objects.shared.js";

// Per-OS MediaObject skins. MediaObject is a "Light" treatment: identical structure
// and semantic colors (those live in media-objects.shared.tsx); only corner radius,
// density/spacing, type tracking, shadow/elevation, and press feedback shift per OS.
//
// Reference (PLATFORM-REFERENCES.md, media-objects row):
// - iOS: no native media-object control; the layout is composed ad hoc as a list row
//   with a leading image (Apple's named "Lockups" is tvOS only). So the iOS skin keeps
//   the structure and applies SF/HIG conventions only: a small inset-group corner radius
//   (~10), no shadow (HIG groups are flat with a hairline), slightly tighter SF type
//   tracking, and an opacity dim on press (~0.8).
// - Android: no native media-object control; the closest M3 idiom is a list item with a
//   leading avatar, icon, or video thumbnail. So the Android skin keeps the structure and
//   applies Material 3 conventions only: more rounding (M3 medium container radius 12 on
//   the bordered card and the icon box), M3 label tracking (+0.1 body, +0.1 title), M3
//   filled-card elevation level 1, denser list-row spacing (gap 16), and a native ripple
//   on press (so the opacity dim is suppressed).
// - Web: keeps the CURRENT Canvas look EXACTLY (rounded-lg / lg-8 radius, gap-3, no
//   shadow, the existing type scale, an opacity dim on press).

export type Align = "center" | "start";
export type Direction = "reversed" | "leading";

// flexDirection per direction (flex-row vs flex-row-reverse). Platform-neutral layout
// map consumed by the shared shell.
export const DIRECTION_ROW: Record<Direction, ViewStyle["flexDirection"]> = {
  leading: "row",
  reversed: "row-reverse",
};

// alignItems per alignment (items-center vs items-start). Platform-neutral.
export const ALIGN_ITEMS: Record<Align, ViewStyle["alignItems"]> = {
  center: "center",
  start: "flex-start",
};

// ── Web (the current Canvas look, preserved verbatim) ───────────────────────────────

export const webSkin: MediaObjectSkin = {
  // flex-row(-reverse) + gap-3 + items-* (the flexDirection/alignItems are composed on top).
  containerBase: { gap: 12 },
  // bordered: rounded-lg border bg-card p-4.
  borderedSurface: { borderRadius: 8, borderWidth: 1, padding: 16 },
  // Leading photo: shrink-0 w-10 h-10 overflow-hidden rounded-full bg-muted.
  photoBox: { flexShrink: 0, width: 40, height: 40, overflow: "hidden", borderRadius: 9999 },
  photoImage: { borderRadius: 9999 },
  // Leading icon box: shrink-0 items-center justify-center w-9 h-9 rounded-md bg-primary/15.
  iconBox: { flexShrink: 0, alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 6 },
  // Glyph: text-base font-semibold text-primary.
  iconGlyph: { fontSize: 16, lineHeight: 24, fontWeight: "600" },
  // Content column: min-w-0 flex-1 gap-0.5.
  content: { minWidth: 0, flexGrow: 1, flexShrink: 1, flexBasis: "0%", gap: 2 },
  // Title: text-sm font-semibold.
  title: { fontSize: 14, lineHeight: 20, fontWeight: "600" },
  // Description: text-xs muted.
  description: { fontSize: 12, lineHeight: 16 },
  // Body: text-sm leading-relaxed.
  body: { fontSize: 14, lineHeight: 28 },
  // Meta: shrink-0 text-xs muted.
  meta: { flexShrink: 0, fontSize: 12, lineHeight: 16 },
  // Trailing action wrapper: shrink-0.
  actionBox: { flexShrink: 0 },
  pressedOpacity: 0.9,
};

// ── iOS (SF / HIG conventions; flat inset-group surface, tightened SF tracking) ──────

export const iosSkin: MediaObjectSkin = {
  containerBase: { gap: 12 },
  // Inset-grouped corner radius (~10), flat (no shadow; HIG groups carry a hairline).
  borderedSurface: { borderRadius: 10, borderWidth: 1, padding: 16 },
  photoBox: { flexShrink: 0, width: 40, height: 40, overflow: "hidden", borderRadius: 9999 },
  photoImage: { borderRadius: 9999 },
  iconBox: { flexShrink: 0, alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8 },
  iconGlyph: { fontSize: 16, lineHeight: 24, fontWeight: "600", letterSpacing: -0.08 },
  content: { minWidth: 0, flexGrow: 1, flexShrink: 1, flexBasis: "0%", gap: 2 },
  // SF body/subhead with the kit's slight negative tracking (matches the badge iOS skin).
  title: { fontSize: 14, lineHeight: 20, fontWeight: "600", letterSpacing: -0.24 },
  description: { fontSize: 12, lineHeight: 16, letterSpacing: -0.08 },
  body: { fontSize: 14, lineHeight: 28, letterSpacing: -0.24 },
  meta: { flexShrink: 0, fontSize: 12, lineHeight: 16, letterSpacing: -0.08 },
  actionBox: { flexShrink: 0 },
  // HIG press: opacity dim ~0.8.
  pressedOpacity: 0.8,
};

// ── Android (Material 3 list-item conventions; more rounding, M3 tracking, elevation) ─

export const androidSkin: MediaObjectSkin = {
  // Denser M3 list-row spacing.
  containerBase: { gap: 16 },
  // M3 medium container radius (12); filled-card elevation level 1 (the `sm` preset → elevation 1).
  borderedSurface: { borderRadius: 12, borderWidth: 1, padding: 16, ...shadow("sm") },
  photoBox: { flexShrink: 0, width: 40, height: 40, overflow: "hidden", borderRadius: 9999 },
  photoImage: { borderRadius: 9999 },
  // M3 medium container radius on the leading icon box.
  iconBox: { flexShrink: 0, alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 12 },
  iconGlyph: { fontSize: 16, lineHeight: 24, fontWeight: "600" },
  content: { minWidth: 0, flexGrow: 1, flexShrink: 1, flexBasis: "0%", gap: 2 },
  // M3 title-medium / body tracking (+0.1 / +0.25).
  title: { fontSize: 14, lineHeight: 20, fontWeight: "600", letterSpacing: 0.1 },
  description: { fontSize: 12, lineHeight: 16, letterSpacing: 0.25 },
  body: { fontSize: 14, lineHeight: 28, letterSpacing: 0.25 },
  meta: { flexShrink: 0, fontSize: 12, lineHeight: 16, letterSpacing: 0.25 },
  actionBox: { flexShrink: 0 },
  // The native ripple carries press feedback; pressDim suppresses the opacity dim on Android.
  pressedOpacity: 0.9,
};
