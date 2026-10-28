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
// in the style list, so the browser's own ring takes the theme's colour on a raw
// TextInput while a kit field that paints its own focus border (FOCUS_RESET) still wins.
// Unlike a control's, a text field's ring shows on every focus, a click included: the
// browser matches `:focus-visible` on any focus of a field that takes typing.
// As for Pressable, Chromium paints its automatic ring in that colour, and Firefox and
// Safari keep their own unless the CSS hand-off's `:focus-visible` rule is loaded.
// Natively the outline keys draw nothing without a width.
//
// Text carries the same ring when it is a link (an `href`, which react-native-web renders
// as an `<a>`, or the `link` role), the one case where a run of text is a keyboard stop:
// Typography's `href` link took the browser's own ring colour before, as a raw scroller
// did before the ScrollView primitive carried it. A link's ring shows on keyboard focus
// only, as a control's does.

import { createContext, forwardRef, useContext, useMemo } from "react";
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
import { DISPLAY_FONT, MONO_FONT } from "./mono.js";
import { useFocusRingStyle } from "./pressable.js";
import { useTheme } from "./theme.js";

/**
 * The face role a run of text takes: one of the theme's registered roles, or `own` for
 * a family the caller named, which the kit never replaces.
 */
type FaceRole = "sans" | "mono" | "display" | "own";

/** A style's face role, from the family it names; a style that names none takes `inherited`. */
function roleOf(family: TextStyle["fontFamily"], inherited: FaceRole): FaceRole {
  if (family == null) return inherited;
  if (family === MONO_FONT) return "mono";
  if (family === DISPLAY_FONT) return "display";
  return "own";
}

// The face role of the Text a nested Text sits in. A nested Text is a span of its
// parent's run (a syntax token in a code line, a bold word in a heading): a span that
// names no family keeps its parent's face, as text inheritance does on every platform,
// instead of taking the theme's `sans` face. Without it a highlighted token inside a
// CodeBlock's mono line painted in the interface face once the app registered fonts,
// because the span's own style names no family. Outside any Text the role is `sans`.
const FaceRoleContext = createContext<FaceRole>("sans");

/**
 * Apply the theme's faces to a text style. Exported for the few components that
 * paint text through something other than Text (an SVG label, a native module).
 * `inherited` is the face role of the enclosing run, which a style naming no family
 * takes (the theme's `sans` face by default).
 */
export function fontStyle(style: StyleProp<TextStyle>, fonts: ThemeFonts, inherited: FaceRole = "sans"): StyleProp<TextStyle> {
  if (!fonts.sans && !fonts.mono && !fonts.display) return style;
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  const role = roleOf(flat?.fontFamily, inherited);
  // A span inside a run of the caller's own family inherits that family untouched.
  if (role === "own") return style;
  const faces = role === "sans" ? fonts.sans : role === "mono" ? fonts.mono : (fonts.display ?? fonts.sans);
  const face = resolveFontFace(faces, flat?.fontWeight, flat?.fontSize);
  if (!face) return style;
  if (!face.dropWeight) return [style, { fontFamily: face.fontFamily }];
  // The face carries its weight: rebuild the flat style without fontWeight, since a
  // later `{ fontWeight: undefined }` entry would not unset it on every platform.
  const { fontWeight: _weight, ...rest } = flat ?? {};
  return { ...rest, fontFamily: face.fontFamily };
}

function useFontStyle(style: StyleProp<TextStyle>, inherited: FaceRole = "sans"): StyleProp<TextStyle> {
  const { fonts } = useTheme();
  return useMemo(() => fontStyle(style, fonts, inherited), [style, fonts, inherited]);
}

// The props a link Text carries beside React Native's own: react-native-web renders a
// Text with an `href` as an `<a>`, and gives the `link` role a tab stop of its own.
type LinkTextProps = { href?: unknown; role?: unknown; accessibilityRole?: unknown };

/** Whether a Text is a link, a keyboard stop the browser rings on the web. */
function isLink(props: LinkTextProps): boolean {
  return props.href != null || props.role === "link" || props.accessibilityRole === "link";
}

/**
 * React Native's Text with the theme's registered typefaces applied, so every label paints
 * in the brand face without a `fontFamily` at the call site. A link Text (an `href`, or
 * the `link` role) also carries the kit's themed focus ring, as Pressable does.
 */
export const Text = forwardRef<RNText, TextProps>(function Text({ style, children, ...rest }, ref) {
  const ring = useFocusRingStyle();
  const inherited = useContext(FaceRoleContext);
  const font = useFontStyle(style, inherited);
  const link = isLink(rest as LinkTextProps);
  // The ring goes first in the list so a link's own outline style wins. Plain text keeps
  // its style as it came, with nothing allocated.
  const themed = useMemo(() => (link ? [ring, font] : font), [link, ring, font]);
  // Only a run whose role differs from the one it sits in publishes it, so the common
  // sans label adds no provider.
  const role = useMemo(() => roleOf((StyleSheet.flatten(style) as TextStyle | undefined)?.fontFamily, inherited), [style, inherited]);
  return (
    <RNText ref={ref} {...rest} style={themed}>
      {role === inherited ? children : <FaceRoleContext.Provider value={role}>{children}</FaceRoleContext.Provider>}
    </RNText>
  );
});

/** TextInput's props: React Native's, plus the focus appearance it keeps. */
export interface CanvasTextInputProps extends TextInputProps {
  /** Keep the platform’s system focus appearance instead of the themed ring. */
  systemFocus?: boolean;
}
/**
 * React Native's TextInput with the theme's registered typefaces applied. Kit fields
 * (Input, Textarea, Select) build on it; reach for them first.
 */
export const TextInput = forwardRef<RNTextInput, CanvasTextInputProps>(function TextInput({ style, systemFocus, ...rest }, ref) {
  const ring = useFocusRingStyle();
  const font = useFontStyle(style);
  // The ring goes first in the list so a field's own outline style wins.
  const themed = useMemo(() => systemFocus ? font : [ring, font], [ring, font, systemFocus]);
  return <RNTextInput ref={ref} {...rest} style={themed} />;
});
