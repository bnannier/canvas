import { FontDisplay } from "expo-font";
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

// Every face is loaded as a FontResource rather than a bare module id so it can carry
// `display: swap`. Without it the browser default is `auto`, which hides text until the
// face arrives; `swap` paints the fallback immediately and repaints once Geist is ready.
// That only matters because the root layout no longer waits for these to resolve before
// rendering, so text is on screen while they are still in flight. The option is web-only
// (it becomes the font-display descriptor on the generated @font-face rule); native
// already behaves like swap, and the extra wrapper is inert there.
const swap = (uri: number) => ({ uri, display: FontDisplay.SWAP });

// Load the Geist faces the docs use, cross-platform (iOS / Android / web). Custom
// fonts in RN don't auto-map fontWeight, so each weight is its own family and we
// select it explicitly via geist()/geistMono() instead of fontWeight.
export function useDocsFonts(): [boolean, Error | null] {
  return useFonts({
    Geist_400Regular: swap(Geist_400Regular),
    Geist_500Medium: swap(Geist_500Medium),
    Geist_600SemiBold: swap(Geist_600SemiBold),
    Geist_700Bold: swap(Geist_700Bold),
    Geist_800ExtraBold: swap(Geist_800ExtraBold),
    GeistMono_400Regular: swap(GeistMono_400Regular),
    GeistMono_500Medium: swap(GeistMono_500Medium),
    GeistMono_600SemiBold: swap(GeistMono_600SemiBold),
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
