import { type ViewStyle } from "react-native";
import { shape } from "../../style/index.js";
import { MONO_FONT } from "../../style/mono.js";
import { platformShape } from "../../style/platform-shape.js";
import { type MediaObjectSkin } from "./media-objects.shared.js";

// Per-OS MediaObject skins. MediaObject takes the Canvas v4 hand-off's media object
// (`K.def('media-objects')` in tools/v4/handoff/cv-kit-data.js, with its code-driven form
// in cv-kit-code3.js `O('media-objects')` and the icon lead in cv-kit-code8.js). Neither
// iOS nor Android ships a media-object control (PLATFORM-REFERENCES.md, media-objects
// row), so every platform draws the hand-off's parts and the native skins differ only in
// the face, the press feedback and the platform's minimum tap height on a bare row.
//
//   A row 12 apart (10 compact). `bordered` is the tile corner on a 1px `border` hairline
//   over the `card` fill, 12 by 14 in, no shadow. The lead is a 40px avatar (28 compact)
//   or a 40px icon box (28 compact) at the emblem corner in the accent's soft wash with
//   an 18px glyph (13) in the accent ink. The title is 500 14 (13 compact), the
//   description 400 12 in the subtle ink, the meta 400 12 mono in the subtle ink.

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

// The icon box at the emblem corners (the hand-off's 28% of its side: 11 on 40, 8 on 28).
const ICON_BOX: ViewStyle = { flexShrink: 0, alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: platformShape.web.emblem };
const COMPACT_ICON_BOX: ViewStyle = { width: 28, height: 28, borderRadius: platformShape.web.emblemSmall };

// ── Web ────────────────────────────────────────────────────────────────────────────

export const webSkin: MediaObjectSkin = {
  // flex-row(-reverse) + the 12 gap + items-* (the flexDirection/alignItems are composed on top).
  containerBase: { gap: 12 },
  // bordered: the tile corner, a border on the card fill, 12 by 14 in.
  borderedSurface: () => ({ borderRadius: shape.web.tile, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 14 }),
  iconBox: ICON_BOX,
  // The glyph: 18 (the hand-off's 45% of the box).
  iconGlyph: { fontSize: 18, lineHeight: 24, fontWeight: "600" },
  // Content column: min-w-0 flex-1, its lines touching.
  content: { minWidth: 0, flexGrow: 1, flexShrink: 1, flexBasis: "0%", gap: 0 },
  title: { fontSize: 14, lineHeight: 20, fontWeight: "500" },
  description: { fontSize: 12, lineHeight: 16, fontWeight: "400" },
  // Body: 14/21.
  body: { fontSize: 14, lineHeight: 21 },
  // Meta: the 400 12 mono caption.
  meta: { flexShrink: 0, fontFamily: MONO_FONT, fontSize: 12, lineHeight: 16, fontWeight: "400" },
  // Trailing action wrapper: shrink-0.
  actionBox: { flexShrink: 0 },
  pressedOpacity: 0.9,
  // Web keeps its content-height rows; the tappable target is a mouse pointer, so no
  // minimum tap height is applied (0 = no change to the established web layout).
  minTarget: 0,
  // Compact (menu-header) density: a 10 gap, a 28px `small` leading avatar or icon box,
  // the title 500 13.
  compact: {
    containerBase: { gap: 10 },
    iconBox: COMPACT_ICON_BOX,
    iconGlyph: { fontSize: 13, lineHeight: 18, fontWeight: "600" },
    title: { fontSize: 13, lineHeight: 18, fontWeight: "500" },
    description: { fontSize: 12, lineHeight: 16, fontWeight: "400" },
  },
};

// ── iOS: the web parts in SF Pro, the HIG press dim and 44pt row ────────────────────

export const iosSkin: MediaObjectSkin = {
  ...webSkin,
  // HIG press: opacity dim ~0.8.
  pressedOpacity: 0.8,
  // HIG minimum tappable area 44x44pt (bare row backstop).
  minTarget: 44,
};

// ── Android: the web parts in Roboto, the ripple and the 48dp row ───────────────────

export const androidSkin: MediaObjectSkin = {
  ...webSkin,
  // M3 minimum touch target 48x48dp (bare row backstop); the native ripple carries the
  // press feedback (pressDim suppresses the opacity dim on Android).
  minTarget: 48,
};
