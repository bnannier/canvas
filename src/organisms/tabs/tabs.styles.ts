import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow } from "../../style/index.js";

// Co-located Tabs styles. Layout-only fragments are static objects; anything that
// reads a color is a function of the active brand tokens (passed in from
// useTheme, so the row, triggers, badges, and the active underline/pill follow
// light/dark and the glass surface). The component resolves its look axis
// (underline / pills / vertical) and selection/block/disabled state, then
// composes these fragments into style arrays.

export type Variant = "underline" | "pills" | "vertical";

// flex-1: an equal-flex trigger in block mode (shares the row width).
export const flex1: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// opacity-50: the dimmed disabled look the component applies per trigger.
export const disabledDim: ViewStyle = { opacity: 0.5 };

// --- outer row containers, by look -----------------------------------------

// w-full vs self-start: in block mode the row fills the available width so
// equal-flex triggers stretch it; otherwise the row hugs its triggers.
export function blockWidth(block: boolean): ViewStyle {
  return block ? { width: "100%" } : { alignSelf: "flex-start" };
}

// underline: flex-row items-center border-b border-border.
export function underlineRow(tokens: ColorTokens): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: tokens.border,
  };
}

// pills: flex-row items-center gap-1 self-start rounded-lg bg-muted p-1. The
// self-start here is the base; block mode swaps it for w-full via blockWidth.
export function pillsRow(tokens: ColorTokens): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    borderRadius: 8,
    backgroundColor: tokens.muted,
    padding: 4,
  };
}

// vertical: flex-col items-stretch gap-1; width w-full (block) or w-[180px].
export function verticalRail(block: boolean): ViewStyle {
  return {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 4,
    width: block ? "100%" : 180,
  };
}

// --- triggers, by look ------------------------------------------------------

// vertical trigger: w-full flex-row items-center gap-1.5 rounded-md px-3 py-2.
// (active:opacity-90 is applied by the component's Pressable pressed branch.)
export const verticalTriggerBase: ViewStyle = {
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  borderRadius: 6,
  paddingHorizontal: 12,
  paddingVertical: 8,
};

// Active vertical trigger is filled with the accent surface; inactive is bare.
export function verticalTriggerFill(tokens: ColorTokens, selected: boolean): ViewStyle {
  return { backgroundColor: selected ? tokens.accent : "transparent" };
}

// pills trigger: flex-row items-center justify-center gap-1.5 rounded-md px-3 py-1.5.
export const pillsTriggerBase: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  borderRadius: 6,
  paddingHorizontal: 12,
  paddingVertical: 6,
};

// Active pill is an elevated background-fill pill (bg-background shadow-sm);
// inactive sits flat and transparent.
export function pillsTriggerFill(tokens: ColorTokens, selected: boolean): ViewStyle {
  return selected
    ? { backgroundColor: tokens.background, ...shadow("sm") }
    : { backgroundColor: "transparent" };
}

// underline trigger: flex-row items-center justify-center gap-1.5 px-4 py-2.5.
export const underlineTriggerBase: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  paddingHorizontal: 16,
  paddingVertical: 10,
};

// The active underline: a 2px primary rule drawn as an explicit sliver pinned to
// the trigger's bottom edge (absolute bottom-0 left-0 right-0 h-0.5 rounded-full).
export function underlineSliver(tokens: ColorTokens, selected: boolean): ViewStyle {
  return {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 9999,
    backgroundColor: selected ? tokens.primary : "transparent",
  };
}

// --- trigger label ----------------------------------------------------------

// text-sm font-medium, shared by all three looks.
export const triggerLabel: TextStyle = { fontSize: 14, lineHeight: 20, fontWeight: "500" };

// Label color per look + selection. underline/pills emphasize with the plain
// foreground; vertical uses accent-foreground (it sits on the accent fill).
export function triggerLabelColor(tokens: ColorTokens, variant: Variant, selected: boolean): TextStyle {
  if (!selected) return { color: tokens["muted-foreground"] };
  return { color: variant === "vertical" ? tokens["accent-foreground"] : tokens.foreground };
}

// --- count badge ------------------------------------------------------------

// CountBadge box: flex-row items-center self-start rounded-md border
// border-transparent bg-secondary px-1.5 py-0.5.
export function countBadgeBox(tokens: ColorTokens): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: tokens.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
  };
}

// CountBadge label: text-xs font-medium; muted when its trigger is inactive.
export const countBadgeLabelType: TextStyle = { fontSize: 12, lineHeight: 16, fontWeight: "500" };

export function countBadgeLabelColor(tokens: ColorTokens, muted: boolean): TextStyle {
  return { color: muted ? tokens["muted-foreground"] : tokens["secondary-foreground"] };
}
