// The kit's Text and TextInput primitives: React Native's own, with the theme's
// registered typefaces applied. Every kit label renders through these (components
// import Text/TextInput from src/style/primitives, which re-exports them), which is
// what lets ONE `fonts` prop on the ThemeProvider put the brand face on every
// component without a fontFamily at any call site.
//
// The rule per node: a style that names no fontFamily gets the theme's `sans` face
// for its weight; a style that asks for the kit's monospace alias (`MONO_FONT`)
// gets the theme's `mono` face; any other explicit fontFamily is the caller's and
// is left alone. When the theme registered no faces the style passes through
// untouched (no flatten, no allocation), so an app that never opts in pays nothing.
//
// TextInput also carries the kit's themed focus ring, exactly as the kit's Pressable
// does (src/style/pressable.tsx): the palette's `ring` colour 2 px off the field, first
// in the style list, so the browser's own keyboard ring takes the theme's colour on a raw
// TextInput while a kit field that paints its own focus border (FOCUS_RESET) still wins.
// As for Pressable, Chromium paints its automatic ring in that colour, and Firefox and
// Safari keep their own unless the CSS hand-off's `:focus-visible` rule is loaded.
// Natively the outline keys draw nothing without a width.

import { forwardRef, useMemo } from "react";
import {
  Text as RNText,
  TextInput as RNTextInput,
  StyleSheet,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from "react-native";
import { resolveFontFace, type ThemeFonts } from "./fonts.js";
import { MONO_FONT } from "./mono.js";
import { useFocusRingStyle } from "./pressable.js";
import { useTheme } from "./theme.js";

/**
 * Apply the theme's faces to a text style. Exported for the few components that
 * paint text through something other than Text (an SVG label, a native module).
 */
export function fontStyle(style: StyleProp<TextStyle>, fonts: ThemeFonts): StyleProp<TextStyle> {
  if (!fonts.sans && !fonts.mono) return style;
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  const family = flat?.fontFamily;
  const faces = family == null ? fonts.sans : family === MONO_FONT ? fonts.mono : undefined;
  const face = resolveFontFace(faces, flat?.fontWeight);
  if (!face) return style;
  if (!face.dropWeight) return [style, { fontFamily: face.fontFamily }];
  // The face carries its weight: rebuild the flat style without fontWeight, since a
  // later `{ fontWeight: undefined }` entry would not unset it on every platform.
  const { fontWeight: _weight, ...rest } = flat ?? {};
  return { ...rest, fontFamily: face.fontFamily };
}

function useFontStyle(style: StyleProp<TextStyle>): StyleProp<TextStyle> {
  const { fonts } = useTheme();
  return useMemo(() => fontStyle(style, fonts), [style, fonts]);
}

/**
 * React Native's Text with the theme's registered typefaces applied, so every label paints
 * in the brand face without a `fontFamily` at the call site.
 */
export const Text = forwardRef<RNText, TextProps>(function Text({ style, ...rest }, ref) {
  return <RNText ref={ref} {...rest} style={useFontStyle(style)} />;
});

/**
 * React Native's TextInput with the theme's registered typefaces applied. Kit fields
 * (Input, Textarea, Select) build on it; reach for them first.
 */
export const TextInput = forwardRef<RNTextInput, TextInputProps>(function TextInput({ style, ...rest }, ref) {
  const ring = useFocusRingStyle();
  const font = useFontStyle(style);
  // The ring goes first in the list so a field's own outline style wins.
  const themed = useMemo(() => [ring, font], [ring, font]);
  return <RNTextInput ref={ref} {...rest} style={themed} />;
});
