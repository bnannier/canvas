import { alpha, FOCUS_RESET } from "../../style/index.js";
import { type CollapsibleSkin } from "./collapsible.shared.js";

// Co-located Collapsible skins, one per platform. The shell resolves the open
// state (controlled/uncontrolled), the accessibility, the chevron rotation, and
// the panel reveal; the skin supplies only the native SHAPE, sizing, title type,
// chevron tint/size, content insets, and press feedback. The BRAND survives on
// every platform (the semantic tokens, never a platform default), so each follows
// light/dark and the glass surface. The collapsible is a CONTENT-layer surface, so
// it stays SOLID (never routed through GlassSurface).
//
// A Collapsible is one accordion Row standing alone, so the skins mirror the
// Accordion's per-platform looks: a single disclosure reads exactly like one
// accordion row.
//
//   Web (Radix / shadcn collapsible, the established Canvas look): no outer
//     container; the header is a full-width row (`py-4`, text-sm / 14px,
//     font-medium) with a trailing chevron (16px, muted) that rotates from 0 to
//     90deg on open; the content panel pads `pb-4` and reads in 14px muted text.
//     Press dims the header. A standalone disclosure has no sibling, so there is no
//     row divider (matching the accordion's last-row, where the rule is dropped).
//   iOS (HIG inset-grouped disclosure / SwiftUI DisclosureGroup): a rounded (12px)
//     inset-grouped card with a hairline `border`, ~17pt SF title, a 15px
//     tertiary-gray chevron rotating 0->90deg, and a roomier (16px) content inset.
//     Native iOS grouped surfaces are flat (no shadow). Press = opacity dim (~0.8).
//   Android (Material 3 expandable list row): M3 has no accordion/expansion-panel
//     component, so the disclosure follows M3 list-item conventions: no outer
//     container, a 16sp titleMedium-ish title, a 24px muted M3 expansion chevron
//     (down at rest, rotating 0->180deg to point up on open), M3 list density (16dp
//     insets), and a header `android_ripple` state layer instead of an opacity dim.

// =============================================================================
// Web: the established Canvas / shadcn look.
// =============================================================================

export const webSkin: CollapsibleSkin = {
  // iOS/web dim the header on press; Android uses a ripple (null here).
  pressedOpacity: 0.85,
  ripple: null,
  // Suppress the react-native-web keyboard-focus blue ring on the header
  // Pressable; the kit paints its own press feedback. No-op natively.
  focusOutlineReset: FOCUS_RESET,

  // Chevron: a 16px muted glyph (shadcn ChevronDown, h-4 w-4, text-muted-foreground).
  chevronSize: 16,
  // Radix/shadcn tree-disclosure caret: right at rest, rotates 0->90deg (points down) on open.
  chevronGlyph: "chevronRight",
  chevronSpinTo: 90,

  // No outer container on web: the disclosure sits flush in its layout.
  container() {
    return {};
  },
  // The header trigger row: full width, space-between, `py-4` (16px) vertical inset.
  header() {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      paddingVertical: 16,
    };
  },
  // shadcn trigger: text-sm (14px) / font-medium / foreground.
  title(t) {
    return { flexShrink: 1, fontSize: 14, lineHeight: 20, fontWeight: "500", color: t.foreground };
  },
  // The content panel: pads the bottom (`pb-4`), text-sm / muted-foreground.
  content() {
    return { paddingBottom: 16 };
  },
  contentText(t) {
    return { fontSize: 14, lineHeight: 22, color: t["muted-foreground"] };
  },
};

// =============================================================================
// iOS (HIG inset-grouped disclosure / SwiftUI DisclosureGroup).
// =============================================================================

export const iosSkin: CollapsibleSkin = {
  pressedOpacity: 0.8, // HIG: dim on press
  ripple: null,
  focusOutlineReset: FOCUS_RESET,

  // SF chevron: ~15pt, tertiary-gray tint.
  chevronSize: 15,
  // HIG tree-disclosure caret: right at rest, rotates 0->90deg (points down) on open.
  chevronGlyph: "chevronRight",
  chevronSpinTo: 90,

  // Inset-grouped card: rounded 12px, a hairline border, a flat (no-shadow)
  // grouped surface filled with the content `card` token (solid).
  container(t) {
    return {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.card,
      overflow: "hidden",
    };
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
  // ~17pt SF body title.
  title(t) {
    return { flexShrink: 1, fontSize: 17, lineHeight: 22, fontWeight: "400", color: t.foreground };
  },
  // Roomier grouped content inset; leading aligns with the title (16px).
  content() {
    return { paddingHorizontal: 16, paddingBottom: 14, paddingTop: 2 };
  },
  contentText(t) {
    return { fontSize: 15, lineHeight: 21, color: t["muted-foreground"] };
  },
};

// =============================================================================
// Android (Material 3 expandable list row).
// =============================================================================

export const androidSkin: CollapsibleSkin = {
  pressedOpacity: null, // Android uses a ripple instead
  ripple: (t) => ({ color: alpha(t.foreground, 0.1), borderless: false }),

  // M3 list trailing icon: 24px, on-surface-variant (muted).
  chevronSize: 24,
  // M3 in-place expansion: a down chevron (expand_more) at rest that rotates
  // 0->180deg to point up (expand_less) on open, NOT the iOS/web drill-in caret.
  chevronGlyph: "chevronDown",
  chevronSpinTo: 180,

  // No outer container: an M3 expandable list row sits flush on the surface.
  container() {
    return {};
  },
  // M3 list item: 16dp horizontal inset, taller (14dp) vertical for a 56dp row.
  header() {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      paddingVertical: 14,
      paddingHorizontal: 16,
    };
  },
  // M3 titleMedium-ish: 16sp, medium weight, on-surface.
  title(t) {
    return { flexShrink: 1, fontSize: 16, lineHeight: 24, fontWeight: "500", color: t.foreground };
  },
  // M3 supporting-text content inset, aligned to the title.
  content() {
    return { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 0 };
  },
  contentText(t) {
    return { fontSize: 14, lineHeight: 20, color: t["muted-foreground"] };
  },
};
