import {
  useFonts,
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  Geist_800ExtraBold,
} from "@expo-google-fonts/geist";
import {
  GeistMono_400Regular,
  GeistMono_500Medium,
  GeistMono_600SemiBold,
} from "@expo-google-fonts/geist-mono";

// Load the Geist faces the docs use, cross-platform (iOS / Android / web). Custom
// fonts in RN don't auto-map fontWeight, so each weight is its own family and we
// select it explicitly via geist()/geistMono() instead of fontWeight.
export function useDocsFonts(): [boolean, Error | null] {
  return useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    Geist_800ExtraBold,
    GeistMono_400Regular,
    GeistMono_500Medium,
    GeistMono_600SemiBold,
  });
}

export type SansWeight = "400" | "500" | "600" | "700" | "800";
export type MonoWeight = "400" | "500" | "600";

const SANS: Record<SansWeight, string> = {
  "400": "Geist_400Regular",
  "500": "Geist_500Medium",
  "600": "Geist_600SemiBold",
  "700": "Geist_700Bold",
  "800": "Geist_800ExtraBold",
};
const MONO: Record<MonoWeight, string> = {
  "400": "GeistMono_400Regular",
  "500": "GeistMono_500Medium",
  "600": "GeistMono_600SemiBold",
};

export const geist = (weight: SansWeight = "400") => SANS[weight];
export const geistMono = (weight: MonoWeight = "400") => MONO[weight];
