import { alpha, FOCUS_RESET } from "../../style/index.js";
import { type AccordionSkin } from "./accordion.shared.js";

// Co-located Accordion skins, one per platform. The shell resolves the open state
// (single vs multiple), the controlled/uncontrolled value, the accessibility, the
// chevron rotation, and the panel reveal; the skin supplies only the native SHAPE,
// sizing, divider, title type, chevron tint/size, content insets, and press
// feedback. The BRAND survives on every platform (the semantic tokens, never a
// platform default), so each follows light/dark and the glass surface. The
// accordion is a CONTENT-layer surface, so it stays SOLID (never routed through
// GlassSurface).
//
//   Web (Radix / shadcn accordion, the established Canvas look): no outer
//     container; each item is separated by a `border-b` hairline; the header is a
//     full-width row (`py-4`, text-sm / 14px, font-medium) with a trailing chevron
//     (16px, muted) that rotates from 0 to 90deg on open; the content panel pads
//     `pb-4` and reads in 14px foreground. Press dims the header.
//   iOS (HIG inset-grouped disclosure / SwiftUI DisclosureGroup): a rounded (12px)
//     inset-grouped card with a hairline `border`, hairline row separators (clipped
//     by the rounded container), ~17pt SF title, a 15px tertiary-gray chevron
//     rotating 0->90deg, and a roomier (16px) content inset. Native iOS grouped
//     surfaces are flat (no shadow). Press = opacity dim (~0.8).
//   Android (Material 3 expandable list rows): M3 has no accordion component, so
//     the rows follow M3 list-item conventions: no outer container, a hairline
//     `border` divider between rows, a 16sp titleMedium-ish title, a 24px
//     muted chevron rotating 0->90deg, M3 list density (16dp insets), and a header
//     `android_ripple` state layer instead of an opacity dim.

// =============================================================================
// Web: the established Canvas / shadcn look.
// =============================================================================

export const webSkin: AccordionSkin = {
  // iOS/web dim the header on press; Android uses a ripple (null here).
  pressedOpacity: 0.85,
  ripple: null,
  // Suppress the react-native-web keyboard-focus blue ring on the header
  // Pressables; the kit paints its own press feedback. No-op natively.
  focusOutlineReset: FOCUS_RESET,

  // Chevron: a 16px muted glyph (shadcn ChevronDown, h-4 w-4, text-muted-foreground).
  chevronSize: 16,

  // No outer container on web: the items stack flush, separated by a bottom rule.
  container() {
    return {};
  },
  // Each item carries a bottom hairline (`border-b`); the last one keeps it too,
  // matching shadcn (the group sits inside its own bordered region in practice).
  item(t, _first, last) {
    return {
      borderBottomWidth: last ? 0 : 1,
      borderColor: t.border,
    };
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
  // shadcn AccordionTrigger: text-sm (14px) / font-medium / foreground.
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

export const iosSkin: AccordionSkin = {
  pressedOpacity: 0.8, // HIG: dim on press
  ripple: null,
  focusOutlineReset: FOCUS_RESET,

  // SF chevron: ~15pt, tertiary-gray tint.
  chevronSize: 15,

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
  // Hairline row separators between grouped rows (none under the last row). The
  // rounded container clips them, so the rule reads as the iOS grouped-list
  // separator. Full-bleed (not inset) keeps the header and content alignment
  // honest; the brief allows a bordered container for the divider.
  item(t, _first, last) {
    return {
      borderBottomWidth: last ? 0 : 1,
      borderColor: t.border,
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
// Android (Material 3 expandable list rows).
// =============================================================================

export const androidSkin: AccordionSkin = {
  pressedOpacity: null, // Android uses a ripple instead
  ripple: (t) => ({ color: alpha(t.foreground, 0.1), borderless: false }),

  // M3 list trailing icon: 24px, on-surface-variant (muted).
  chevronSize: 24,

  // No outer container: M3 expandable list rows stack flush on the surface,
  // separated by a full-bleed divider.
  container() {
    return {};
  },
  // M3 full-bleed divider between rows (1dp); none under the last row.
  item(t, _first, last) {
    return {
      borderBottomWidth: last ? 0 : 1,
      borderColor: t.border,
    };
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
