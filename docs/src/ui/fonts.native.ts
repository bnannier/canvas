import { useFonts } from "expo-font";
import type { ThemeFonts } from "@nannier/canvas";
import { DISPLAY, DISPLAY_FILES } from "./display-faces.native";

// The docs' typefaces on iOS and Android: static cuts registered through expo-font and read
// from the bundle before the first frame (the root layout waits for them). Each face is one
// weight, cut by scripts/subset-fonts.mjs from the full files the @expo-google-fonts packages
// carry (Instrument Sans at 400 to 700, the 700 being the `bold` weight prop's; JetBrains
// Mono at 400, 500 for the eyebrow and 600) and, for the display face, from the variable
// Bricolage Grotesque source pinned per weight at the optical sizes the display roles set
// (./display-faces.native.ts), since neither platform sets a variable font's optical-size
// axis from the text's size. Custom fonts in React Native do not map fontWeight, so each
// weight is its own family: the kit picks the registered face nearest a style's weight and
// drops the weight (ThemeProvider `fonts`), and the docs' own chrome asks sans() for one.
// The web loads none of these: its document declares the hand-off's three variable files
// (./fonts.ts, the module Metro resolves there); this one is the platform fork for iOS and
// Android, with the same exports, so the root layout, the docs theme and the chrome need no
// fork of their own.
const InstrumentSans_400Regular = require("../../assets/fonts/InstrumentSans_400Regular.ttf");
const InstrumentSans_500Medium = require("../../assets/fonts/InstrumentSans_500Medium.ttf");
const InstrumentSans_600SemiBold = require("../../assets/fonts/InstrumentSans_600SemiBold.ttf");
const InstrumentSans_700Bold = require("../../assets/fonts/InstrumentSans_700Bold.ttf");
const JetBrainsMono_400Regular = require("../../assets/fonts/JetBrainsMono_400Regular.ttf");
const JetBrainsMono_500Medium = require("../../assets/fonts/JetBrainsMono_500Medium.ttf");
const JetBrainsMono_600SemiBold = require("../../assets/fonts/JetBrainsMono_600SemiBold.ttf");

/** Whether the faces are registered yet: the tree waits for them, and this is the real answer. */
export function useDocsFonts(): [boolean, Error | null] {
  return useFonts({
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
    ...DISPLAY_FILES,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });
}

export type SansWeight = "400" | "500" | "600" | "700";
export type MonoWeight = "400" | "500" | "600";

const SANS: Record<SansWeight, string> = {
  "400": "InstrumentSans_400Regular",
  "500": "InstrumentSans_500Medium",
  "600": "InstrumentSans_600SemiBold",
  "700": "InstrumentSans_700Bold",
};
const MONO: Record<MonoWeight, string> = {
  "400": "JetBrainsMono_400Regular",
  "500": "JetBrainsMono_500Medium",
  "600": "JetBrainsMono_600SemiBold",
};

/**
 * The registered faces the kit paints with (ThemeProvider `fonts`): one face per
 * weight, so the kit's Text primitive picks the nearest registered family for a style's
 * fontWeight and drops the weight (a per-weight face already carries it). A weight the
 * scale does not use snaps to its nearest face (an old 800 to Instrument Sans 700, a
 * display 700 to Bricolage 600). A module constant, so the theme value is not rebuilt on
 * every render.
 */
export const CANVAS_FONTS: ThemeFonts = { sans: SANS, display: DISPLAY, mono: MONO };

/** The interface face by weight, for the docs' own chrome (the kit gets it through `fonts`). */
export const sans = (weight: SansWeight = "400") => SANS[weight];
