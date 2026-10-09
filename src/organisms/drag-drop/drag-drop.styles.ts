import { type ViewStyle } from "react-native";
import { type ColorTokens, shadow, alpha, shape } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";

// Co-located DragDrop skins, one per platform, all driven by the brand tokens (passed in from
// useTheme so they follow light/dark and the glass surface). DragDrop is a "Light" treatment:
// the structure, gesture, geometry, and accessibility live in drag-drop.shared.tsx; the skin
// carries only the small per-OS deltas: the grip handle's touch target, and the brand-tinted
// drop affordances (the over-zone ring, the insertion line, the drag ghost's elevation). The
// affordance COLORS are the brand `primary` on every platform; only the handle sizing changes
// per OS. The grip dims on press everywhere (its PanResponder owns the gesture, so a
// Pressable + android_ripple would fight it; the dim is the cross-platform feedback).

export interface DragDropSkin {
  /** The grip handle surface (square touch target, platform radius, centered glyph). */
  handle: ViewStyle;
  /** The grip glyph (gripVertical) size in px. */
  handleIconSize: number;
  /** Opacity applied to the grip while pressed/dragging (the cross-platform press feedback). */
  handlePressedOpacity: number;
  /** The over-zone highlight: an absolute ring + faint fill painted inside the active target. */
  zoneActive: (t: ColorTokens) => ViewStyle;
  /** The keyboard-drag "grabbed" outline on the handle (a focus-like ring while carried). */
  handleGrabbed: (t: ColorTokens) => ViewStyle;
  /** The insertion indicator line color/thickness/radius; the shell sizes + positions it. */
  indicator: (t: ColorTokens) => ViewStyle;
  /** The dragging ghost surface (elevation/opacity/radius) layered over the page. */
  ghost: (t: ColorTokens) => ViewStyle;
}

// Shared affordances (identical on every platform): the drop ring, the grabbed ring, the
// insertion line, and the ghost elevation are all brand `primary`, so a Canvas drag reads the
// same everywhere. Only the handle differs per OS, below. The drop ring lies over the zone
// at the card corner, the corner of the surface a zone is.
function zoneActive(t: ColorTokens): ViewStyle {
  return { borderWidth: 2, borderColor: t.primary, borderRadius: shape.web.card, backgroundColor: alpha(t.primary, 0.06) };
}
function handleGrabbed(t: ColorTokens): ViewStyle {
  return { borderWidth: 2, borderColor: t.primary, backgroundColor: alpha(t.primary, 0.12) };
}
// The insertion line is a capsule along its 2px thickness.
function indicator(t: ColorTokens): ViewStyle {
  return { backgroundColor: t.primary, borderRadius: 9999 };
}
function ghost(t: ColorTokens): ViewStyle {
  return { borderRadius: platformShape.web.dragGhost, opacity: 0.96, ...shadow("lg", t) };
}

const CENTER: ViewStyle = { alignItems: "center", justifyContent: "center" };

// The compact grip at the control corner: the web's, and iOS's too, since iOS ships no
// drag handle control.
const GRIP: ViewStyle = { ...CENTER, width: 32, height: 32, borderRadius: shape.web.control };

// Web: a compact 32px grip.
export const webSkin: DragDropSkin = {
  handle: GRIP,
  handleIconSize: 16,
  handlePressedOpacity: 0.6,
  zoneActive,
  handleGrabbed,
  indicator,
  ghost,
};

// iOS (HIG): the 32px grip. The row height already meets the 44pt target, so the grip stays
// visually compact within it while the whole row remains the comfortable touch area.
export const iosSkin: DragDropSkin = {
  handle: GRIP,
  handleIconSize: 18,
  handlePressedOpacity: 0.6,
  zoneActive,
  handleGrabbed,
  indicator,
  ghost,
};

// Android (Material 3): a 40px circular grip (the M3 min touch target within a dense row).
export const androidSkin: DragDropSkin = {
  handle: { ...CENTER, width: 40, height: 40, borderRadius: shape.android.control },
  handleIconSize: 20,
  handlePressedOpacity: 0.6,
  zoneActive,
  handleGrabbed,
  indicator,
  ghost,
};
