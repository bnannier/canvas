import { hoverFill } from "../../style/hover.js";
import { primaryText } from "../../style/primary-text.js";
import { MONO_FONT } from "../../style/mono.js";
import { shadow } from "../../style/shadow.js";
import { type TextStyle, type ViewStyle } from "react-native";
import { type ColorTokens, alpha, shape } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { INSET_FOCUS_RING } from "../../style/pressable.js";
import { HOVER } from "../../style/motion.js";
import { type SidebarSkin } from "./sidebar.shared.js";

// Co-located Sidebar skins, one per platform. The shell resolves the density,
// frame, and collapse axes, the section grouping, the flat-index active matching,
// the accordion open-state, the badges, the markers, and the select handler; the skin
// supplies only the native SHAPE of the nav row (its radius and height), the
// selected-row highlight (fill + label/icon color), the section heading, the frame
// (outer column), the collapse + accordion + header/footer chrome, and the press
// feedback. The BRAND survives on every platform (the `primary` and `accent` tokens,
// never a platform default), so each follows light/dark, the palette and the glass
// surface.
//
//   iOS 27 (Liquid Glass) sidebar: grouped rows; the SELECTED row is a CAPSULE
//     highlight (radius 9999) filled with the light-gray `accent`, label in
//     `accent-foreground`, while the leading icon stays TINTED in `primary`;
//     section headers ~13pt 600 muted; ~36pt rows; press = opacity dim (0.8);
//     collapsible-section chevron = the HIG right caret (0 -> 90deg).
//   Android (M3 navigation drawer): each nav item is a fully-rounded PILL (radius
//     9999); the ACTIVE item is a tonal `primary-soft` pill with the icon + label in
//     brand `primary-text`; inactive transparent with `foreground`; ~56dp item height;
//     press = android_ripple; collapsed rail = the 72dp M3 navigation rail;
//     collapsible-section chevron = the M3 expand_more (0 -> 180deg).
//   Web: the Canvas v4 hand-off's rail (`K.def('sidebar')` in
//     tools/v4/handoff/cv-kit-inputs.js for the default density, the docs rail
//     `CanvasRail.dc.html` for `compact`): a 232 px column on the sunken page tone,
//     rows 36 px tall (30 compact) at the nav-row corner with a 10 px inset,
//     500 13 px labels in the secondary ink, the active row on the accent's soft wash in
//     the accent's text ink, and a mono 11 px uppercase eyebrow over each group.

export type Density = "default" | "compact";
export type Frame = "flush" | "bordered" | "floating";

// The outer column, shared across skins: the rail/expanded width, the shell-vs-legacy
// inner spacing, and the per-frame border. In SHELL mode (a header/footer is present)
// the column fills the parent height and drops its inner padding/gap onto the scroll
// body; in LEGACY mode it keeps the content-sized padding/gap exactly as before.
// `floating` is `bordered` unless the skin gives it a lift of its own.
interface ColumnLook {
  radius: number;
  width: number;
  collapsedWidth: number;
  pad: ViewStyle;
  fill?: (tokens: ColorTokens) => string;
  rim?: (tokens: ColorTokens) => string;
  floatingRadius?: number;
  lift?: (tokens: ColorTokens) => ViewStyle;
}

function makeColumn(look: ColumnLook) {
  return (tokens: ColorTokens, frame: Frame, collapsed: boolean, shell: boolean): ViewStyle => {
    const width = collapsed ? look.collapsedWidth : look.width;
    const backgroundColor = look.fill ? look.fill(tokens) : tokens.background;
    // maxWidth caps the rail inside narrower parents (a phone screen without the
    // responsive drawer mode) so a bare sidebar can shrink instead of overflowing.
    const base: ViewStyle = shell
      ? { width, maxWidth: "100%", backgroundColor, flex: 1 }
      : { width, maxWidth: "100%", backgroundColor, ...look.pad };
    if (frame === "flush") return { ...base, borderEndWidth: 1, borderColor: tokens.border };
    const rim = look.rim ? look.rim(tokens) : tokens.border;
    const card: ViewStyle = { ...base, borderRadius: look.radius, borderWidth: 1, borderColor: rim, overflow: "hidden" };
    if (frame === "floating" && look.lift) return { ...card, borderRadius: look.floatingRadius ?? look.radius, ...look.lift(tokens) };
    return card;
  };
}

/** The trailing 5 px marker dot a row draws under `markers` (the hand-off rail's). */
function markerDot(size: number) {
  return (tokens: ColorTokens, kind: "active" | "marked"): ViewStyle => ({
    width: size,
    height: size,
    borderRadius: 9999,
    // The active page takes the accent; a row of the current place takes the
    // field hairline (the hand-off's `ln2`), a quiet "you are in here" mark.
    backgroundColor: kind === "active" ? tokens.primary : tokens["field-border"],
  });
}

// The heading line every skin lays out the same way: the title and its count at
// either end of one row; the skins differ in the inset.
const HEADING_ROW: ViewStyle = { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 };

// =============================================================================
// Web: the Canvas v4 rail.
// =============================================================================

// The mono eyebrow the hand-off sets over each group and in its section heading:
// JetBrains Mono 500 11/11, tracked 0.08 em, uppercase, in the subtle ink (the
// accent's text ink for the current place).
function webEyebrow(tokens: ColorTokens, current: boolean): TextStyle {
  return {
    fontFamily: MONO_FONT,
    fontSize: 11,
    lineHeight: 11,
    fontWeight: "500",
    letterSpacing: 0.88,
    textTransform: "uppercase",
    color: current ? primaryText(tokens) : (tokens["subtle-foreground"] ?? tokens["muted-foreground"]),
  };
}

export const webSkin: SidebarSkin = {
  pressedFill: false,
  pressedOpacity: null,
  ripple: null,
  // Keyboard focus shows the kit's themed ring inside the full-width row, where the
  // column's scroll clip cannot cut it. No-op natively.
  focusRing: INSET_FOCUS_RING,
  // The nav wash: the translucent `hover` fades in beneath a hovered row over 150 ms and
  // back out on leave (`accent`, its composite on card, where a palette omits it).
  wash: { motion: HOVER.wash, color: hoverFill },

  // The hand-off's column: 232 px (64 as the rail), 12 px inset, the sunken page tone
  // (`bg2`); flush docks with a hairline end edge, bordered is the rail card inside the
  // field hairline (`ln2`), floating the rounder floating-rail card on the medium shadow.
  column: makeColumn({
    radius: platformShape.web.rail,
    width: 232,
    collapsedWidth: 64,
    pad: { gap: 16, padding: 12 },
    fill: (t) => t["surface-sunken"] ?? t.background,
    rim: (t) => t["field-border"] ?? t.border,
    floatingRadius: platformShape.web.floatingRail,
    lift: (t) => shadow("md", t),
  }),

  // Rows sit 4 px apart (the renderer's default), 1 px in the compact rail.
  group: (density) => ({ gap: density === "compact" ? 1 : 4 }),

  // The eyebrow: the renderer's 6/8 inset by default, the rail's 0 10 6 compact.
  sectionHeading(_tokens, density) {
    return { ...HEADING_ROW, ...(density === "compact" ? { paddingHorizontal: 10, paddingBottom: 6 } : { paddingHorizontal: 8, paddingVertical: 6 }) };
  },
  sectionTitle(tokens, _density, current) {
    return { ...webEyebrow(tokens, current), flexShrink: 1 };
  },
  sectionCount(tokens, current) {
    return webEyebrow(tokens, current);
  },

  row(_tokens, density, collapsed) {
    const compact = density === "compact";
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: collapsed ? "center" : "flex-start",
      gap: collapsed ? 0 : compact ? 8 : 10,
      height: compact ? 30 : 36,
      borderRadius: compact ? platformShape.web.navRowCompact : platformShape.web.navRow,
      paddingHorizontal: collapsed ? 0 : 10,
    };
  },

  // The active row rides the accent's soft wash (`ion-soft`).
  rowFill(tokens, active) {
    return active ? { backgroundColor: tokens["primary-soft"] ?? alpha(tokens.primary, 0.16) } : null;
  },
  smallCount: true,
  marker: markerDot(5),

  // 500 13 px in the secondary ink, the foreground ink in the current place; the active
  // row takes the accent's text ink (600 in the compact rail, as the docs rail draws it).
  label(tokens, active, density, lifted) {
    return {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: "0%",
      fontSize: 13,
      lineHeight: 16,
      fontWeight: active && density === "compact" ? "600" : "500",
      color: active ? primaryText(tokens) : lifted ? tokens.foreground : tokens["muted-foreground"],
    };
  },

  iconTint(active) {
    return active ? { primary: true } : { muted: true };
  },
  iconSize: 16,

  // --- collapse ---
  collapsedWidth: 64,
  collapseToggle: () => ({ padding: 6, borderRadius: shape.web.control }),
  collapseIconSize: 14,

  // --- shell slots ---
  // The header grows past its 56 px floor when its content is taller (a filter field
  // over an eyebrow row), and its content stretches to the column's width.
  header(tokens, collapsed) {
    return {
      minHeight: 56,
      flexDirection: "row",
      alignItems: "center",
      gap: collapsed ? 0 : 10,
      justifyContent: collapsed ? "center" : "flex-start",
      paddingHorizontal: collapsed ? 0 : 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderColor: tokens.border,
    };
  },
  footer(tokens) {
    return { padding: 12, borderTopWidth: 1, borderColor: tokens.border };
  },
  scroll: { flex: 1 },
  scrollContent(_tokens, collapsed) {
    return { padding: 12, paddingBottom: 16, gap: collapsed ? 8 : 16 };
  },

  // --- collapsible section header ---
  sectionHeaderRow(_tokens, density) {
    return { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: density === "compact" ? platformShape.web.navRowCompact : platformShape.web.navRow };
  },
  sectionHeaderTitle(tokens, current) {
    return { flexGrow: 1, flexShrink: 1, flexBasis: "0%", ...webEyebrow(tokens, current) };
  },
  sectionChevronGlyph: "chevronRight",
  sectionChevronSpinTo: 90,
  sectionChevronSize: 11,
  activeDot(tokens) {
    return { width: 5, height: 5, borderRadius: 9999, backgroundColor: tokens.primary };
  },
  drillBackRow(tokens) {
    return { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: tokens.border, marginBottom: 4 };
  },
  drillBackTitle(tokens) {
    return { fontSize: 15, lineHeight: 20, fontWeight: "600", color: tokens.foreground };
  },
};

// =============================================================================
// iOS 27 (Liquid Glass) sidebar.
// =============================================================================

export const iosSkin: SidebarSkin = {
  pressedFill: false,
  pressedOpacity: 0.8,
  ripple: null,

  focusRing: INSET_FOCUS_RING,

  // A bordered sidebar is an iOS grouped surface, at the card corner.
  column: makeColumn({ radius: shape.ios.card, width: 240, collapsedWidth: 56, pad: { gap: 16, padding: 8 } }),

  group: () => ({ gap: 2 }),

  sectionHeading() {
    return { ...HEADING_ROW, paddingHorizontal: 12, paddingVertical: 4 };
  },
  sectionTitle(tokens, _density, current) {
    return {
      flexShrink: 1,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "600",
      color: current ? primaryText(tokens) : tokens["muted-foreground"],
    };
  },
  sectionCount(tokens, current) {
    return { fontSize: 13, lineHeight: 18, color: current ? primaryText(tokens) : tokens["muted-foreground"] };
  },

  row(_tokens, density, collapsed) {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: collapsed ? "center" : "flex-start",
      gap: collapsed ? 0 : 10,
      borderRadius: shape.ios.control,
      paddingHorizontal: collapsed ? 0 : 12,
      paddingVertical: density === "compact" ? 6 : 8,
    };
  },

  rowFill(tokens, active) {
    return active ? { backgroundColor: tokens.accent } : null;
  },
  marker: markerDot(6),

  label(tokens, active, density) {
    return {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: "0%",
      ...(density === "compact" ? { fontSize: 14, lineHeight: 18 } : { fontSize: 15, lineHeight: 20 }),
      fontWeight: active ? "600" : "400",
      color: active ? tokens["accent-foreground"] : tokens.foreground,
    };
  },

  iconTint(_active) {
    return { primary: true };
  },
  iconSize: 17,

  // --- collapse ---
  collapsedWidth: 56,
  collapseToggle: () => ({ padding: 4 }),
  collapseIconSize: 15,

  // --- shell slots ---
  header(tokens, collapsed) {
    return {
      minHeight: 56,
      flexDirection: "row",
      alignItems: "center",
      gap: collapsed ? 0 : 10,
      justifyContent: collapsed ? "center" : "flex-start",
      paddingHorizontal: collapsed ? 0 : 14,
      borderBottomWidth: 1,
      borderColor: tokens.border,
    };
  },
  footer(tokens) {
    return { padding: 8, borderTopWidth: 1, borderColor: tokens.border };
  },
  scroll: { flex: 1 },
  scrollContent(_tokens, collapsed) {
    return { padding: 8, paddingBottom: 16, gap: collapsed ? 8 : 16 };
  },

  // --- collapsible section header ---
  sectionHeaderRow() {
    return { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999 };
  },
  sectionHeaderTitle(tokens, current) {
    return {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: "0%",
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "600",
      color: current ? primaryText(tokens) : tokens["muted-foreground"],
    };
  },
  sectionChevronGlyph: "chevronRight",
  sectionChevronSpinTo: 90,
  sectionChevronSize: 13,
  activeDot(tokens) {
    return { width: 6, height: 6, borderRadius: 9999, backgroundColor: tokens.primary };
  },
  drillBackRow(tokens) {
    return { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: tokens.border, marginBottom: 4 };
  },
  drillBackTitle(tokens) {
    return { fontSize: 16, lineHeight: 21, fontWeight: "600", color: tokens.foreground };
  },
};

// =============================================================================
// Android (Material 3 navigation drawer / rail).
// =============================================================================

export const androidSkin: SidebarSkin = {
  pressedFill: false,
  pressedOpacity: null,
  ripple: (tokens) => ({ color: alpha(tokens.primary, 0.12), borderless: false }),
  focusRing: INSET_FOCUS_RING,

  // A bordered sidebar takes the M3 navigation drawer's large shape.
  column: makeColumn({ radius: platformShape.android.navigationDrawer, width: 240, collapsedWidth: 72, pad: { gap: 16, paddingHorizontal: 12, paddingVertical: 8 } }),

  group: () => ({ gap: 2 }),

  sectionHeading() {
    return { ...HEADING_ROW, paddingHorizontal: 16, paddingVertical: 6 };
  },
  sectionTitle(tokens, _density, current) {
    return {
      flexShrink: 1,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
      color: current ? primaryText(tokens) : tokens["muted-foreground"],
    };
  },
  sectionCount(tokens, current) {
    return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: current ? primaryText(tokens) : tokens["muted-foreground"] };
  },

  row(_tokens, density, collapsed) {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: collapsed ? "center" : "flex-start",
      gap: collapsed ? 0 : 12,
      borderRadius: shape.android.control,
      // Clip the Material ripple to the rounded pill outline.
      overflow: "hidden",
      paddingHorizontal: collapsed ? 0 : 16,
      paddingVertical: density === "compact" ? 12 : 16,
    };
  },

  // The active pill is the accent's soft wash, the hand-off's colour for M3's
  // secondary container (its Android navigation bar's active indicator).
  rowFill(tokens, active) {
    return active ? { backgroundColor: tokens["primary-soft"] ?? alpha(tokens.primary, 0.12) } : null;
  },
  marker: markerDot(6),

  label(tokens, active, density) {
    return {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: "0%",
      ...(density === "compact" ? { fontSize: 13, lineHeight: 18 } : { fontSize: 14, lineHeight: 20 }),
      fontWeight: "500",
      color: active ? primaryText(tokens) : tokens.foreground,
    };
  },

  iconTint(active) {
    return active ? { primary: true } : {};
  },
  iconSize: 18,

  // --- collapse ---
  collapsedWidth: 72,
  collapseToggle: () => ({ padding: 8, borderRadius: shape.android.control, overflow: "hidden" }),
  collapseIconSize: 18,

  // --- shell slots ---
  header(tokens, collapsed) {
    return {
      minHeight: 56,
      flexDirection: "row",
      alignItems: "center",
      gap: collapsed ? 0 : 12,
      justifyContent: collapsed ? "center" : "flex-start",
      paddingHorizontal: collapsed ? 0 : 16,
      borderBottomWidth: 1,
      borderColor: tokens.border,
    };
  },
  footer(tokens) {
    return { paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderColor: tokens.border };
  },
  scroll: { flex: 1 },
  scrollContent(_tokens, collapsed) {
    return { paddingHorizontal: 12, paddingVertical: 8, paddingBottom: 16, gap: collapsed ? 8 : 16 };
  },

  // --- collapsible section header ---
  sectionHeaderRow() {
    return { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 9999 };
  },
  sectionHeaderTitle(tokens, current) {
    return {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: "0%",
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
      color: current ? primaryText(tokens) : tokens["muted-foreground"],
    };
  },
  sectionChevronGlyph: "chevronDown",
  sectionChevronSpinTo: 180,
  sectionChevronSize: 18,
  activeDot(tokens) {
    return { width: 6, height: 6, borderRadius: 9999, backgroundColor: tokens.primary };
  },
  drillBackRow(tokens) {
    return { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: tokens.border, marginBottom: 4 };
  },
  drillBackTitle(tokens) {
    return { fontSize: 16, lineHeight: 24, fontWeight: "500", color: tokens.foreground };
  },
};
