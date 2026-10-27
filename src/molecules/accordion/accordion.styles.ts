import { surfaceRipple, shape, type ColorTokens } from "../../style/index.js";
import { INSET_FOCUS_RING } from "../../style/pressable.js";
import { type ViewStyle } from "react-native";
import { type AccordionSkin } from "./accordion.shared.js";

// Co-located Accordion skins, one per platform. The shell resolves the open state
// (single vs multiple), the controlled/uncontrolled value, the accessibility, the
// chevron rotation, and the panel reveal; the skin supplies only the SHAPE, sizing,
// divider, title type, chevron size, content insets, and press feedback. Every colour is
// the hand-off's semantic token, so each follows light/dark and the glass surface.
// Filled variants use static content frost with this skin as their complete opaque
// fallback. Unfilled variants inherit their host surface.
//
//   Web (the Canvas v4 hand-off, `K.def('accordion')` in tools/v4/handoff/cv-kit-data.js
//     with its code-driven rows, cv-kit-code3.js `O('accordion')`): no outer container
//     unless `card`, which draws the card corner on a `border` hairline over the `card`
//     fill and insets the rows 18. Rows are parted by a `border` hairline; the header
//     is a 14 px row (500 14 title, 12 apart from a 16 px chevron in the subtle ink,
//     rotating 0 to 180 deg on open) whose title takes the accent's text ink under the
//     pointer; a description sits 2 under it in 400 12 subtle; the panel pads 14 at the
//     bottom and reads 400 14 / 1.55 in the muted ink. A disabled row dims to 0.4.
//   iOS (HIG disclosure / SwiftUI DisclosureGroup, the platform's own control): a
//     continuous-curve inset-grouped card at the iOS card corner on a hairline,
//     separators inset to the 16 pt leading edge, a 17 pt SF title, a 15 pt subtle
//     chevron rotating 0 to 90 deg, and a 16 pt content inset, in the hand-off's colours. Press = opacity dim (~0.8).
//   Android: Material 3 ships no accordion (PLATFORM-REFERENCES.md), so Android draws
//     the web skin's parts in Roboto, with the platform's ripple for press feedback.

// =============================================================================
// Web: the v4 hand-off's accordion.
// =============================================================================

export const webSkin: AccordionSkin = {
  // iOS/web dim the header on press; Android uses a ripple (null here).
  pressedOpacity: 0.85,
  ripple: null,
  // Keyboard focus shows the kit's themed ring, drawn inside the full-bleed header so
  // the card's clip cannot cut it. No-op natively.
  focusRing: INSET_FOCUS_RING,

  // Chevron: a 16px glyph in the subtle ink, ChevronDown at rest rotating 0->180deg.
  chevronSize: 16,
  chevronGlyph: "chevronDown",
  chevronSpinTo: 180,

  // No outer container: the items stack flush, parted by a hairline.
  container() {
    return {};
  },
  // The `card` variant: the card corner on a `border` hairline over the `card` fill;
  // overflow hidden clips the header ink and the full-bleed dividers to the corner.
  cardContainer(t) {
    return { borderRadius: shape.web.card, borderWidth: 1, borderColor: t.border, backgroundColor: t.card, overflow: "hidden" };
  },
  // Card mode insets the rows 18 from the card's edge.
  cardHeaderInset: { paddingHorizontal: 18 },
  cardContentInset: { paddingHorizontal: 18 },
  // A full-bleed 1px hairline between rows; dropped after the last row.
  separator(t) {
    return { height: 1, backgroundColor: t.border };
  },
  // The header trigger row: full width, space-between, a 14px vertical inset, 12 apart.
  header() {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingVertical: 14,
    };
  },
  // 500 14 in the foreground.
  title(t) {
    return { flexShrink: 1, fontSize: 14, lineHeight: 20, fontWeight: "500", color: t.foreground };
  },
  // The hovered header's title: the accent's text ink.
  titleHover(t) {
    return { color: t["primary-text"] };
  },
  // 400 12 in the subtle ink, 2 under the title (the shell's label column gap).
  description(t) {
    return { fontSize: 12, lineHeight: 16, fontWeight: "400", color: t["subtle-foreground"] };
  },
  // The content panel pads 14 at the bottom and reads 400 14 / 1.55 in the muted ink.
  content() {
    return { paddingBottom: 14 };
  },
  contentText(t) {
    return { fontSize: 14, lineHeight: 21.7, fontWeight: "400", color: t["muted-foreground"] };
  },
};

// =============================================================================
// iOS (HIG inset-grouped disclosure / SwiftUI DisclosureGroup).
// =============================================================================

// The iOS inset-grouped card: the iOS card corner with the superellipse (continuous)
// corner curve, a hairline border, a flat (no-shadow) grouped surface filled with
// the content `card` token (solid). `borderCurve` is an RN iOS-only prop (no-op
// elsewhere). Shared by `container` (the default look) AND `cardContainer`: the
// default iOS Accordion already IS the card surface, so `card` is a documented
// no-op on iOS.
const iosInsetGroupedCard = (t: ColorTokens): ViewStyle => ({
  borderRadius: shape.ios.card,
  borderCurve: "continuous",
  borderWidth: 1,
  borderColor: t.border,
  backgroundColor: t.card,
  overflow: "hidden",
});

export const iosSkin: AccordionSkin = {
  pressedOpacity: 0.8, // HIG: dim on press
  ripple: null,
  focusRing: INSET_FOCUS_RING,

  // SF chevron: ~15pt, in the subtle ink.
  chevronSize: 15,
  // HIG tree-disclosure caret: right at rest, rotates 0->90deg (points down) on open.
  chevronGlyph: "chevronRight",
  chevronSpinTo: 90,

  // The default iOS look IS the inset-grouped card (see iosInsetGroupedCard above).
  container: iosInsetGroupedCard,
  // `card` is a documented no-op on iOS: it aliases the same container styles,
  // and the idempotent insets below match the header/content's own 16px.
  cardContainer: iosInsetGroupedCard,
  cardHeaderInset: { paddingHorizontal: 16 },
  cardContentInset: { paddingHorizontal: 16 },
  // Hairline row separators between grouped rows (the shell renders it only when
  // `!last`). Inset to the 16pt text leading edge and running to the trailing edge,
  // matching the real iOS grouped-list separator; the rounded container clips it.
  separator(t) {
    return { height: 1, marginLeft: 16, backgroundColor: t.border };
  },
  // Inset-grouped row: 16px horizontal inset, 11px vertical for a ~44pt target.
  header() {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingVertical: 11,
      paddingHorizontal: 16,
    };
  },
  // ~17pt SF body title with SF Pro Text tracking (17pt = -0.43).
  title(t) {
    return { flexShrink: 1, fontSize: 17, lineHeight: 22, fontWeight: "400", letterSpacing: -0.43, color: t.foreground };
  },
  // SF footnote (13pt, tracking -0.08) in the secondary gray: the iOS subtitle
  // cell's muted second line.
  description(t) {
    return { fontSize: 13, lineHeight: 18, letterSpacing: -0.08, color: t["muted-foreground"] };
  },
  // Roomier grouped content inset; leading aligns with the title (16px).
  content() {
    return { paddingHorizontal: 16, paddingBottom: 14, paddingTop: 2 };
  },
  // 15pt content with SF Pro Text tracking (15pt = -0.24).
  contentText(t) {
    return { fontSize: 15, lineHeight: 21, letterSpacing: -0.24, color: t["muted-foreground"] };
  },
};

// =============================================================================
// Android: Material 3 ships no accordion, so the web skin's parts in Roboto, with the
// platform's ripple in place of the pressed dim.
// =============================================================================

export const androidSkin: AccordionSkin = {
  ...webSkin,
  pressedOpacity: null, // Android uses a ripple instead
  // M3 state-layer ripple, routed through the shared surfaceRipple helper (neutral
  // foreground ink at 10% alpha); the unrounded row needs no clip.
  ripple: (t) => surfaceRipple(t),
};
