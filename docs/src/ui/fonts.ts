import { Platform } from "react-native";
import { FontDisplay, useFonts } from "expo-font";
import type { ThemeFonts } from "@nannier/canvas";

// The nine faces, cut down to the glyphs the docs can show by scripts/subset-fonts.mjs
// from the full files the @expo-google-fonts packages carry (those packages are dev
// dependencies now, the subsetter's input). Every face is on the first paint's
// critical path, since each pre-rendered page preloads them all, and the full files
// held Greek, Cyrillic and Vietnamese the docs never render: the subsets are about
// 297 KB over the wire for all nine against 405 KB. The v4 type scale needs nine where
// Manrope and Geist Mono took seven (166 KB): Instrument Sans at 400 to 700 (the 700 is
// the `bold` weight prop's), Bricolage Grotesque at the display roles' 500 and 600, and
// JetBrains Mono at 400, 500 (the eyebrow) and 600.
const InstrumentSans_400Regular = require("../../assets/fonts/InstrumentSans_400Regular.ttf");
const InstrumentSans_500Medium = require("../../assets/fonts/InstrumentSans_500Medium.ttf");
const InstrumentSans_600SemiBold = require("../../assets/fonts/InstrumentSans_600SemiBold.ttf");
const InstrumentSans_700Bold = require("../../assets/fonts/InstrumentSans_700Bold.ttf");
const BricolageGrotesque_500Medium = require("../../assets/fonts/BricolageGrotesque_500Medium.ttf");
const BricolageGrotesque_600SemiBold = require("../../assets/fonts/BricolageGrotesque_600SemiBold.ttf");
const JetBrainsMono_400Regular = require("../../assets/fonts/JetBrainsMono_400Regular.ttf");
const JetBrainsMono_500Medium = require("../../assets/fonts/JetBrainsMono_500Medium.ttf");
const JetBrainsMono_600SemiBold = require("../../assets/fonts/JetBrainsMono_600SemiBold.ttf");

// Every face is loaded as a FontResource rather than a bare module id so it can carry
// `display: swap`. Without it the browser default is `auto`, which hides text until the
// face arrives; `swap` paints the fallback immediately and repaints once the face is ready.
// The root layout currently gates the app on fontsLoaded (docs/src/app/_layout.tsx), so
// in the normal path nothing renders before the faces resolve; swap is the safety net
// for a face that arrives late or fails, and it keeps text visible if that gate is ever
// dropped. The option is web-only (it becomes the font-display descriptor on the
// generated @font-face rule); native already behaves like swap, and the extra wrapper
// is inert there.
const swap = (uri: number) => ({ uri, display: FontDisplay.SWAP });

// Load the three typefaces the docs use, cross-platform (iOS / Android / web), each
// handed to the kit through the ThemeProvider `fonts` prop below: Instrument Sans is the
// kit's interface face (`typeface.sans`) and is worn by the docs' own chrome too;
// Bricolage Grotesque is the display face (`typeface.display`) the skins set headings and
// big numbers in; JetBrains Mono (`typeface.mono`) sets the code. Custom fonts in RN
// don't auto-map fontWeight, so each weight is its own family and is selected explicitly
// (the kit does it through `fonts`, the chrome via sans()).
//
// `useFonts` comes from expo-font itself, not from the @expo-google-fonts re-export. The
// re-export is a plain client hook that starts false and flips in an effect, and effects
// never run in a static render, so every pre-rendered page came out EMPTY behind the
// root layout's font gate. expo-font's hook knows about the server: there it registers
// each face so the exporter writes the @font-face rules and the preload links into the
// page's head.
//
// On the web the gate is reported open outright. The document owns the faces there:
// the pre-rendered head preloads them and declares them, so they are loading before
// the bundle has even arrived, and the server always renders the tree. Asking the hook
// instead would make the hydration render depend on the browser's CSSOM: expo-font
// decides a face is loaded by finding its @font-face rule, and before 57.0.2 it compared
// the rule's `fontFamily` string as serialised, which Firefox quotes, so it answered
// "not loaded" there, the hydration render produced an empty tree against a full page,
// and React rebuilt the whole document. The hook still runs on the web client, and its
// mount effect loads every face it does not find: with that comparison it declared
// every face again in Firefox right after hydration (the style element moved once per
// face, a second rule per face, every face fetched again, the text hidden and then set in a
// fallback face before its own). So the docs need expo-font 57.0.2 or later, and
// e2e/journeys/fonts.e2e.ts holds every engine to adopting the document's faces. On iOS
// and Android the answer is the real one: the faces are read from the bundle, and the
// tree waits for them.
export function useDocsFonts(): [boolean, Error | null] {
  const [loaded, error] = useFonts({
    InstrumentSans_400Regular: swap(InstrumentSans_400Regular),
    InstrumentSans_500Medium: swap(InstrumentSans_500Medium),
    InstrumentSans_600SemiBold: swap(InstrumentSans_600SemiBold),
    InstrumentSans_700Bold: swap(InstrumentSans_700Bold),
    BricolageGrotesque_500Medium: swap(BricolageGrotesque_500Medium),
    BricolageGrotesque_600SemiBold: swap(BricolageGrotesque_600SemiBold),
    JetBrainsMono_400Regular: swap(JetBrainsMono_400Regular),
    JetBrainsMono_500Medium: swap(JetBrainsMono_500Medium),
    JetBrainsMono_600SemiBold: swap(JetBrainsMono_600SemiBold),
  });
  return [Platform.OS === "web" || loaded, error];
}

export type SansWeight = "400" | "500" | "600" | "700";
export type DisplayWeight = "500" | "600";
export type MonoWeight = "400" | "500" | "600";

const SANS: Record<SansWeight, string> = {
  "400": "InstrumentSans_400Regular",
  "500": "InstrumentSans_500Medium",
  "600": "InstrumentSans_600SemiBold",
  "700": "InstrumentSans_700Bold",
};
const DISPLAY: Record<DisplayWeight, string> = {
  "500": "BricolageGrotesque_500Medium",
  "600": "BricolageGrotesque_600SemiBold",
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
