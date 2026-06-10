// Desktop-first responsive selection. This replaces the engine's breakpoint
// className variants (`sm:`/`md:`/...) with a value picker that follows the exact
// same semantics: the `base` value is the desktop case, and a breakpoint entry
// applies at that width AND BELOW, with the smallest matching breakpoint winning.
//
// A component declares the values it wants per breakpoint and reads the active
// one for the current viewport:
//
//   const direction = useResponsive({ base: "row", sm: "column" });
//   // <View style={{ flexDirection: direction }} />
//
// Only the breakpoints present in the map are considered, mirroring how a
// className like `flex-row sm:flex-col` only flips at the `sm` threshold.

import { useWindowDimensions } from "react-native";
import { breakpoints } from "./tokens.js";

/** The breakpoint keys, in ascending pixel order. */
export type BreakpointKey = "sm" | "md" | "lg" | "xl" | "2xl";

/** A value that varies by breakpoint. `base` is the desktop default (required). */
export type Responsive<T> = { base: T } & Partial<Record<BreakpointKey, T>>;

// Ascending by px, so the first match when scanning is the smallest breakpoint
// that still covers the width, which is the one that wins (desktop-first).
const ASCENDING: BreakpointKey[] = ["sm", "md", "lg", "xl", "2xl"];

/** Pure picker: resolve a Responsive map to its active value at the given width. */
export function responsive<T>(width: number, map: Responsive<T>): T {
  for (const bp of ASCENDING) {
    const value = map[bp];
    if (value !== undefined && width <= breakpoints[bp]) {
      return value;
    }
  }
  return map.base;
}

/** Hook form: resolve a Responsive map against the current viewport width. */
export function useResponsive<T>(map: Responsive<T>): T {
  const { width } = useWindowDimensions();
  return responsive(width, map);
}

export { useWindowDimensions };
