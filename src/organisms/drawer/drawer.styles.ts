import { type ViewStyle } from "react-native";
import { type ColorTokens, shadow } from "../../style/index.js";

// Co-located Drawer skins, one per platform, all driven by the brand tokens
// (passed in from useTheme so they follow light/dark). Drawer is a "Light"
// platform treatment: ONE structure (a full-screen Modal whose scrim lays an
// opaque panel against an edge), with only small per-OS touches: the edge/corner
// radius, the inner-edge border vs. lineless, the elevation, and the scrim
// dimming. The BRAND survives on every platform (the SOLID `card` fill and the
// content type are unchanged); only the native SHAPE/elevation/scrim shift:
//   iOS (HIG sheet): a lineless panel (no border) with the iOS sheet's large
//     continuous corner radius on the inner edge — a side drawer rounds its
//     leading (inner) edge ~38, a bottom sheet rounds its top corners ~16 — over
//     a soft elevation; the scrim is the iOS dimming (~0.4).
//   Android (Material 3 side sheet): a lineless panel with the M3 side-sheet
//     rounding — a side sheet rounds its INNER (content-facing) vertical edge 16,
//     a bottom sheet rounds its top corners 28 — over M3 elevation; the scrim is
//     the M3 standard scrim (~0.32).
//   Web: the established Canvas look (the current drawer, lifted verbatim) — an
//     opaque `card` panel with a 1px `border` hairline on its inner edge (a 16
//     rounded-top bottom sheet), no shadow, over a 0.5 black scrim.
//
// The fill is the SOLID `card` token, not a glass material, on every platform: a
// full-screen drawer sits directly over page content, so a translucent panel
// would bleed the content through. An opaque panel keeps it legible.

// Edge the panel is anchored to. `left`/`right` are full-height side drawers;
// `bottom` is a sheet that spans the width and rises from the bottom.
export type Edge = "left" | "right" | "bottom";

// The contract a platform skin fulfills. The shell owns the full-screen Modal,
// the scrim, the panel positioner, the edge precedence, the open/close state, and
// the hardware-back wiring; the skin maps the active platform's scrim dimming and
// the panel shape (radius, border, elevation) per edge onto each piece, reading
// the tokens so light/dark keep working.
export interface DrawerSkin {
  /** The scrim dimming alpha behind the panel (iOS ~0.4, Android ~0.32, web 0.5). */
  scrimOpacity: number;
  /** The panel surface shape per edge: fill, edge geometry, border, radius, elevation. */
  panelShape: (edge: Edge, width: number, t: ColorTokens) => ViewStyle;
}

// --- scrim + positioner (identical across platforms) ------------------------

// The full-screen scrim that fills the Modal and lays the panel against its edge.
// A tap on it (wired in the shell) dismisses the drawer. The dimming alpha is the
// only per-OS value, supplied by the skin.
export function scrim(edge: Edge, opacity: number): ViewStyle {
  const base: ViewStyle = { flex: 1, backgroundColor: `rgba(0,0,0,${opacity})` };
  if (edge === "bottom") return { ...base, flexDirection: "column", justifyContent: "flex-end" };
  return { ...base, flexDirection: "row", justifyContent: edge === "right" ? "flex-end" : "flex-start" };
}

// The panel positioner: a Pressable that catches taps so a press inside the panel
// does not fall through to the scrim. Side drawers fill the height; the sheet
// fills the width. Identical across platforms.
export const panelPos: Record<Edge, ViewStyle> = {
  left: { height: "100%" },
  right: { height: "100%" },
  bottom: { width: "100%" },
};

// Shared panel base: the opaque SOLID `card` fill and clipped corners. The skin
// adds the per-edge geometry (width/height), the border (or none), the radius,
// and the elevation on top of this.
function panelBase(t: ColorTokens): ViewStyle {
  return { backgroundColor: t.card, overflow: "hidden" };
}

// ---------- Web: the established Canvas look (lifted verbatim) ----------
// The current drawer panel: an opaque `card` surface with a 1px `border` hairline
// on its inner edge (the side drawer borders its content-facing vertical edge;
// the bottom sheet borders its top edge and rounds the top corners 16). No
// shadow. The scrim is a 0.5 black dim.
export const webSkin: DrawerSkin = {
  scrimOpacity: 0.5,
  panelShape: (edge, width, t) => {
    const base = panelBase(t);
    if (edge === "bottom") {
      return {
        ...base,
        width: "100%",
        maxHeight: "85%",
        borderTopWidth: 1,
        borderColor: t.border,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      };
    }
    return {
      ...base,
      width,
      height: "100%",
      borderColor: t.border,
      ...(edge === "right" ? { borderLeftWidth: 1 } : { borderRightWidth: 1 }),
    };
  },
};

// ---------- iOS (HIG sheet): lineless, large continuous corners, soft elevation ----------
// The iOS panel reads as a sheet: lineless (no hairline border) with the iOS
// sheet's large continuous corner radius on the inner edge — a side drawer rounds
// its leading (content-facing) vertical edge ~38, a bottom sheet rounds its top
// corners ~16 — over a soft elevation. The scrim dims to ~0.4. The SOLID `card`
// fill is unchanged (a full-screen takeover stays opaque).
const IOS_SIDE_RADIUS = 38;
const IOS_SHEET_RADIUS = 16;
export const iosSkin: DrawerSkin = {
  scrimOpacity: 0.4,
  panelShape: (edge, width, t) => {
    const base = panelBase(t);
    if (edge === "bottom") {
      return {
        ...base,
        width: "100%",
        maxHeight: "85%",
        borderTopLeftRadius: IOS_SHEET_RADIUS,
        borderTopRightRadius: IOS_SHEET_RADIUS,
        ...shadow("xl"),
      };
    }
    // The leading (inner) vertical edge rounds; the outer edge sits flush to the
    // screen edge. A left drawer rounds its right corners; a right drawer its left.
    const inner =
      edge === "right"
        ? { borderTopLeftRadius: IOS_SIDE_RADIUS, borderBottomLeftRadius: IOS_SIDE_RADIUS }
        : { borderTopRightRadius: IOS_SIDE_RADIUS, borderBottomRightRadius: IOS_SIDE_RADIUS };
    return { ...base, width, height: "100%", ...inner, ...shadow("xl") };
  },
};

// ---------- Android (Material 3 side sheet): lineless, M3 rounding, elevation ----------
// The M3 side sheet: a lineless panel (no border) with the M3 rounding — a side
// sheet rounds its INNER (content-facing) vertical edge 16 (the M3 large shape),
// a bottom sheet rounds its top corners 28 (the M3 extra-large shape) — over M3
// elevation. The scrim is the M3 standard scrim (~0.32). The SOLID `card` fill is
// unchanged.
const ANDROID_SIDE_RADIUS = 16;
const ANDROID_SHEET_RADIUS = 28;
export const androidSkin: DrawerSkin = {
  scrimOpacity: 0.32,
  panelShape: (edge, width, t) => {
    const base = panelBase(t);
    if (edge === "bottom") {
      return {
        ...base,
        width: "100%",
        maxHeight: "85%",
        borderTopLeftRadius: ANDROID_SHEET_RADIUS,
        borderTopRightRadius: ANDROID_SHEET_RADIUS,
        ...shadow("lg"),
      };
    }
    // The inner (content-facing) vertical edge rounds; the outer edge sits flush.
    const inner =
      edge === "right"
        ? { borderTopLeftRadius: ANDROID_SIDE_RADIUS, borderBottomLeftRadius: ANDROID_SIDE_RADIUS }
        : { borderTopRightRadius: ANDROID_SIDE_RADIUS, borderBottomRightRadius: ANDROID_SIDE_RADIUS };
    return { ...base, width, height: "100%", ...inner, ...shadow("lg") };
  },
};
