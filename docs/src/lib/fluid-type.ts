import { useWindowDimensions } from "react-native";

// Fluid type for the docs app's marketing/reference typography: the RN spelling of
// CSS clamp(lo, width * factor, hi), rounded to a whole px. This is app typography
// (the home hero, the token-page h1), not a kit gap: kit components size type from
// the Typography roles, so the helper stays docs-local.
export function useFluidType(lo: number, hi: number, factor: number): number {
  const { width } = useWindowDimensions();
  return Math.round(Math.min(hi, Math.max(lo, width * factor)));
}
