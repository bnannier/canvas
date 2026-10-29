import { surfaceRipple, shape, type ColorTokens } from "../../style/index.js";
import { INSET_FOCUS_RING } from "../../style/pressable.js";
import { platformShape } from "../../style/platform-shape.js";
import { MONO_FONT } from "../../style/mono.js";
import { type ViewStyle } from "react-native";
import { type CollapsibleSkin } from "./collapsible.shared.js";

// Co-located Collapsible skins, one per platform. The shell resolves the open
// state (controlled/uncontrolled), the accessibility, the chevron rotation, and
// the panel reveal; the skin supplies only the SHAPE, sizing, title type, chevron
// size, content insets, and press feedback. Every colour is the hand-off's semantic
// token, so each follows light/dark and the glass surface. Filled variants use static
// content frost; the skin supplies their complete solid fallback. Unfilled variants
// inherit.
//
//   Web (the Canvas v4 hand-off's disclosure, cv-kit-code3.js `O('collapsible')` with
//     its states in cv-kit-code8.js; `K.def('collapsible')` in cv-kit-data.js): no
//     outer container unless `card`, which draws the disclosure's own corner on a
//     `border` hairline over the `card` fill. The header is a 10 by 2 row (14 by 16 in
//     the card), the 500 14 title 12 apart from a trailing 16 px chevron in the subtle
//     ink that rotates 0 to 180 deg on open, a 400 12 subtle description 2 under the
//     title. Under the pointer the header takes the `secondary` wash at the inset-row
//     corner. The panel pads 10 at the bottom (16 in the card) and reads 400 14 / 1.55
//     in the muted ink. A disabled disclosure dims to 0.45.
//   iOS (HIG disclosure / SwiftUI DisclosureGroup, the platform's own control): a
//     continuous-curve inset-grouped card at the iOS card corner on a hairline, a
//     17 pt SF title, a 15 pt subtle chevron rotating 0 to 90 deg, and a 16 pt
//     content inset, in the hand-off's colours. Press = opacity dim (~0.8).
//   Android: Material 3 ships no expansion panel (PLATFORM-REFERENCES.md), so Android
//     draws the web skin's parts in Roboto, with the platform's ripple for press
//     feedback.

// =============================================================================
// Web: the v4 hand-off's disclosure.
// =============================================================================

export const webSkin: CollapsibleSkin = {
  // iOS/web dim the header on press; Android uses a ripple (null here).
  pressedOpacity: 0.85,
  // The hand-off's disabled disclosure.
  disabledOpacity: 0.45,
  ripple: null,
  // Keyboard focus shows the kit's themed ring, drawn inside the full-bleed header so
  // the card's clip cannot cut it. No-op natively.
  focusRing: INSET_FOCUS_RING,

  // Chevron: a trailing 16px glyph in the subtle ink, down at rest, up when open.
  chevronSize: 16,
  chevronGlyph: "chevronDown",
  chevronSpinTo: 180,

  // No outer container: the disclosure sits flush in its layout.
  container() {
    return {};
  },
  // The `card` variant: the disclosure card corner on a `border` hairline over the
  // `card` fill; overflow hidden clips the header ink to the rounded corner.
  cardContainer(t) {
    return { borderRadius: platformShape.web.disclosureCard, borderWidth: 1, borderColor: t.border, backgroundColor: t.card, overflow: "hidden" };
  },
  // Card mode insets the header 14 by 16 and the content 16 from the card's edge.
  cardHeaderInset: { paddingHorizontal: 16, paddingVertical: 14 },
  cardContentInset: { paddingHorizontal: 16, paddingBottom: 16 },
  // The hand-off's reference-sheet disclosure, a sub-component's props card
  // (Component.dc.html lines 245 to 250).
  reference: {
    // Line 245: `border:1px solid var(--ln);border-radius:16px;overflow:hidden;
    // background:var(--sf)`: the card corner on the `border` hairline over the card fill.
    container(t) {
      return { borderRadius: shape.web.card, borderWidth: 1, borderColor: t.border, backgroundColor: t.card, overflow: "hidden" };
    },
    // Line 246: `width:100%;height:46px;padding:0 16px`, the toggle; a floor rather than a
    // fixed height, so a wrapped name is never clipped, and at one line it is exactly 46.
    header: { minHeight: 46, paddingHorizontal: 16, paddingVertical: 0 },
    // Line 246: `style-hover="background:var(--sf3)"`, the whole toggle, square to the card's clip.
    hover(t) {
      return { backgroundColor: t.secondary };
    },
    // Line 246: `font:600 14px var(--ft)` with no ratio, so its line is the face's own
    // `normal`: 18 px for Instrument Sans at 14, measured in Chromium on the hand-off page
    // served from tools/v4/handoff.
    title(t) {
      return { fontSize: 14, lineHeight: 18, fontWeight: "600", color: t.foreground };
    },
    // Line 246: `font:400 12px var(--fm);color:var(--tx3)`, the count inline after the
    // name, on the mono face's own 16 px line at 12 (measured as above).
    description(t) {
      return { fontFamily: MONO_FONT, fontSize: 12, lineHeight: 16, fontWeight: "400", color: t["subtle-foreground"] };
    },
    // Lines 247 to 249: the sub-table sits flush inside the card, its rows ruled above.
    content: { paddingHorizontal: 0, paddingBottom: 0 },
  },
  // The header trigger row: full width, space-between, 10 by 2, 12 apart.
  header() {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingVertical: 10,
      paddingHorizontal: 2,
    };
  },
  // The hovered header: the `secondary` wash (the hand-off's sf3) at the inset-row corner.
  headerHover(t) {
    return { backgroundColor: t.secondary, borderRadius: platformShape.web.insetRow };
  },
  // 500 14 in the foreground.
  title(t) {
    return { flexShrink: 1, fontSize: 14, lineHeight: 20, fontWeight: "500", color: t.foreground };
  },
  // 400 12 in the subtle ink.
  description(t) {
    return { fontSize: 12, lineHeight: 16, fontWeight: "400", color: t["subtle-foreground"] };
  },
  // The content panel: 2 in, 10 at the bottom.
  content() {
    return { paddingHorizontal: 2, paddingBottom: 10 };
  },
  // 400 14 / 1.55 in the muted ink.
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
// default iOS Collapsible already IS the card surface, so `card` is a documented
// no-op on iOS.
const iosInsetGroupedCard = (t: ColorTokens): ViewStyle => ({
  borderRadius: shape.ios.card,
  borderCurve: "continuous",
  borderWidth: 1,
  borderColor: t.border,
  backgroundColor: t.card,
  overflow: "hidden",
});

export const iosSkin: CollapsibleSkin = {
  pressedOpacity: 0.8, // HIG: dim on press
  disabledOpacity: 0.5, // HIG dimmed disclosure
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
// Android: Material 3 ships no expansion panel, so the web skin's parts in Roboto,
// with the platform's ripple in place of the pressed dim and the pointer wash.
// =============================================================================

export const androidSkin: CollapsibleSkin = {
  ...webSkin,
  pressedOpacity: null, // Android uses a ripple instead
  headerHover: undefined,
  // M3 state-layer ripple, routed through the shared surfaceRipple helper (neutral
  // foreground ink at 10% alpha); the unrounded row needs no clip.
  ripple: (t) => surfaceRipple(t),
};
