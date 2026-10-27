import { type TextStyle, type ViewStyle } from "react-native";
import { type ColorTokens, shadow, shape } from "../../style/index.js";
import { MONO_FONT } from "../../style/mono.js";
import { platformShape } from "../../style/platform-shape.js";

// The DragDrop skin, drawn to the Canvas v4 hand-off (`K.def('drag-drop')` in
// tools/v4/handoff/cv-kit-data.js and its code-driven parts, cv-kit-code3.js `O('drag-drop')`
// with the `DropZone` and `DragHandle` it registers). The structure, gesture, geometry and
// accessibility live in drag-drop.shared.tsx; the skin carries the look.
//
// Neither iOS nor Android ships a drag-and-drop control (PLATFORM-REFERENCES.md: both are
// system interactions apps attach to their own views), so every platform draws the
// hand-off's affordances; only the grip's touch target follows the platform's minimum.
//
//   A `bordered` zone is the sunken well (`surface-sunken`) at the lane corner on a 1.5 px
//     dashed `field-border` edge, 10 in, its items 8 apart under the 11 px mono eyebrow
//     (the zone's label) in the subtle ink.
//   A zone a drag is over takes the accent: its dashed edge in the accent over the accent's
//     soft wash (an unbordered zone gets the same edge and wash as an overlay at the lane
//     corner), and the insertion line is a 3 px accent capsule glowing 10 px in the
//     accent's glow.
//   The grip is the 15 px gripVertical glyph in the subtle ink.
//   The ghost (the lifted item) sits under the large shade.

export interface DragDropSkin {
  /** The grip handle surface (square touch target, platform radius, centered glyph). */
  handle: ViewStyle;
  /** The grip glyph (gripVertical) size in px. */
  handleIconSize: number;
  /** The grip glyph's ink. */
  handleIconColor: (t: ColorTokens) => string;
  /** Opacity applied to the grip while pressed/dragging (the cross-platform press feedback). */
  handlePressedOpacity: number;
  /** A `bordered` zone's resting well. */
  zoneWell: (t: ColorTokens) => ViewStyle;
  /** A `bordered` zone's well while a drag is over it. */
  zoneWellActive: (t: ColorTokens) => ViewStyle;
  /** A `bordered` zone's label, its eyebrow. */
  zoneLabel: (t: ColorTokens) => TextStyle;
  /** The over-zone highlight on an unbordered zone: an absolute edge + wash inside the target. */
  zoneActive: (t: ColorTokens) => ViewStyle;
  /** The keyboard-drag "grabbed" outline on the handle (a focus-like ring while carried). */
  handleGrabbed: (t: ColorTokens) => ViewStyle;
  /** The insertion indicator's thickness in px; the shell sizes + positions it. */
  indicatorThickness: number;
  /** The insertion indicator's fill, corner and glow. */
  indicator: (t: ColorTokens) => ViewStyle;
  /** The dragging ghost surface (elevation/opacity/radius) layered over the page. */
  ghost: (t: ColorTokens) => ViewStyle;
}

// The hand-off's affordances, shared by every platform.
const subtle = (t: ColorTokens): string => t["subtle-foreground"] ?? t["muted-foreground"];
const DASHED: ViewStyle = { borderWidth: 1.5, borderStyle: "dashed", borderRadius: platformShape.web.lane };
function zoneWell(t: ColorTokens): ViewStyle {
  return { ...DASHED, borderColor: t["field-border"], backgroundColor: t["surface-sunken"], padding: 10, gap: 8 };
}
function zoneWellActive(t: ColorTokens): ViewStyle {
  return { borderColor: t.primary, backgroundColor: t["primary-soft"] };
}
function zoneLabel(t: ColorTokens): TextStyle {
  return { fontFamily: MONO_FONT, fontSize: 11, lineHeight: 14, fontWeight: "500", letterSpacing: 0.88, textTransform: "uppercase", color: subtle(t) };
}
function zoneActive(t: ColorTokens): ViewStyle {
  return { ...DASHED, borderColor: t.primary, backgroundColor: t["primary-soft"] };
}
function handleGrabbed(t: ColorTokens): ViewStyle {
  return { borderWidth: 2, borderColor: t.primary, backgroundColor: t["primary-soft"] };
}
// The insertion line is a capsule along its thickness, glowing in the accent.
function indicator(t: ColorTokens): ViewStyle {
  return { backgroundColor: t.primary, borderRadius: 9999, boxShadow: `0px 0px 10px ${t.glow}` };
}
function ghost(t: ColorTokens): ViewStyle {
  return { borderRadius: platformShape.web.dragGhost, opacity: 0.96, ...shadow("lg", t) };
}

const CENTER: ViewStyle = { alignItems: "center", justifyContent: "center" };

// The compact grip at the control corner: the web's, and iOS's too, since iOS ships no
// drag handle control.
const GRIP: ViewStyle = { ...CENTER, width: 32, height: 32, borderRadius: shape.web.control };

const parts = {
  handleIconSize: 15,
  handleIconColor: subtle,
  handlePressedOpacity: 0.6,
  zoneWell,
  zoneWellActive,
  zoneLabel,
  zoneActive,
  handleGrabbed,
  indicatorThickness: 3,
  indicator,
  ghost,
};

/** Web: a compact 32px grip. */
export const webSkin: DragDropSkin = { handle: GRIP, ...parts };

/**
 * iOS: the 32pt grip. The row height already meets the 44pt target, so the grip stays
 * visually compact within it while the whole row remains the comfortable touch area.
 */
export const iosSkin: DragDropSkin = { handle: GRIP, ...parts };

/** Android: a 40dp circular grip (the Material 3 minimum touch target within a dense row). */
export const androidSkin: DragDropSkin = { handle: { ...CENTER, width: 40, height: 40, borderRadius: shape.android.control }, ...parts };
