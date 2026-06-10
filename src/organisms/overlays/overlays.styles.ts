import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow, alpha } from "../../style/index.js";

// Co-located Overlay styles. Layout-only fragments are static objects; anything
// that reads a color is a function of the active tokens (so the popover surface
// follows light/dark, and reads as glass when the ThemeProvider's surface is
// "glass", since tokens.popover is swapped translucent at the theming level).

export type Placement = "drawer" | "sheet" | "modal";

// --- outer wrapper + trigger ------------------------------------------------

// w-full: the overlay occupies the full width of its slot.
export const root: ViewStyle = { width: "100%" };

// self-start: the trigger button hugs the leading edge.
export const triggerWrap: ViewStyle = { alignSelf: "flex-start" };

// --- backdrop ---------------------------------------------------------------

// The contained dim scrim: relative w-full overflow-hidden rounded-lg bg-black/50.
// (mt-3 is applied conditionally by the component when a trigger is present.)
export function backdrop(): ViewStyle {
  return {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: alpha("#000000", 0.5),
  };
}

// mt-3: gap below the trigger button, applied only when a trigger is rendered.
export const backdropWithTrigger: ViewStyle = { marginTop: 12 };

// The backdrop's alignment per placement. The modal centers its card; the
// drawer and sheet let the absolutely-positioned surface anchor itself.
export const backdropPlacement: Record<Placement, ViewStyle> = {
  drawer: {},
  sheet: {},
  // items-center justify-center
  modal: { alignItems: "center", justifyContent: "center" },
};

// --- overlay surface --------------------------------------------------------

// The overlay surface per placement: drawer anchors right + full height, sheet
// anchors to the bottom edge, modal is a self-centered floating card. Each
// carries the popover fill, a border, padding, and the shadow-xl elevation.
export function surface(tokens: ColorTokens, placement: Placement): ViewStyle {
  switch (placement) {
    // absolute top-0 right-0 bottom-0 w-[300px] bg-popover border-l border-border p-5 shadow-xl
    case "drawer":
      return {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: 300,
        backgroundColor: tokens.popover,
        borderLeftWidth: 1,
        borderColor: tokens.border,
        padding: 20,
        ...shadow("xl"),
      };
    // absolute left-0 right-0 bottom-0 bg-popover border-t border-border rounded-t-lg p-5 shadow-xl
    case "sheet":
      return {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: tokens.popover,
        borderTopWidth: 1,
        borderColor: tokens.border,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        padding: 20,
        ...shadow("xl"),
      };
    // self-center my-12 w-full max-w-[420px] bg-popover border border-border rounded-lg p-6 shadow-xl
    case "modal":
      return {
        alignSelf: "center",
        marginVertical: 48,
        width: "100%",
        maxWidth: 420,
        backgroundColor: tokens.popover,
        borderWidth: 1,
        borderColor: tokens.border,
        borderRadius: 8,
        padding: 24,
        ...shadow("xl"),
      };
  }
}

// --- surface contents -------------------------------------------------------

// text-base font-semibold text-popover-foreground
export function title(tokens: ColorTokens): TextStyle {
  return { fontSize: 16, lineHeight: 24, fontWeight: "600", color: tokens["popover-foreground"] };
}

// text-sm text-muted-foreground mt-2
export function description(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"], marginTop: 8 };
}

// flex-row justify-end mt-6: the footer action row.
export const footer: ViewStyle = { flexDirection: "row", justifyContent: "flex-end", marginTop: 24 };
