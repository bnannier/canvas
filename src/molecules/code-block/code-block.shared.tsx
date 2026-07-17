import { type GestureResponderEvent, StyleSheet } from "react-native";
import { View, Pressable, Text, useTheme, surfaceRipple, pressDim, RippleClip, cornerRadii, splitElevation, type ColorTokens, type StyleProp, type ViewStyle, type TextStyle } from "../../style/index.js";
import { MONO, type Variant } from "./code-block.styles.js";

// Shared CodeBlock shell. The structure (the muted code surface and its terminal /
// numbered / inline variants, the optional copy affordance), the boolean-prop axes,
// the variant precedence, and the line-splitting logic live here once; a platform
// file supplies only its skin (shape, padding, type) and calls createCodeBlock.
//
// CodeBlock is a "Shared" platform treatment: neither iOS nor Android ships a code
// display control (apps roll their own monospaced view), and the web reference is the
// standard `pre`/`code` HTML pattern. So there is ONE look on every platform — the
// iOS and Android skins reference the same values as the web skin (see
// code-block.styles). The skin contract still exists so the file pattern matches the
// rest of the kit, but it carries no fabricated per-OS difference.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match precedence
// within an axis (mirrors Badge's toneOf). Axes:
//
// - Variant (pick one; default is the plain block):
//     `terminal` > `numbered` > `inline` > plain.
//   - plain: the muted code surface, padded, monospace.
//   - terminal: a dark window with a chrome bar (traffic-light dots + a "bash"
//     label) over a dark body, for shell transcripts. A leading "$ " prompt is
//     rendered for command lines.
//   - numbered: the plain surface with a left gutter of right-aligned line
//     numbers, one per line.
//   - inline: a short, single token rendered as an inline pill (rounded bg-muted
//     chip), for code mentioned mid-sentence.
// - `copy` (orthogonal): show a copy affordance pinned to the top-right corner.
//   Ignored by the inline variant, which is too small to carry one.
// - `wrap` (orthogonal): let long lines wrap instead of overflowing. Ignored by
//   the inline variant.
//
// RN has no font-mono utility, so the monospace face is requested via an inline
// `style={MONO}` on each code Text (the same approach Badge's `mono` uses).

// The contract a platform skin fulfills. Every piece is a self-contained style
// fragment (or a token-driven function) for one part of the surface; the shell wires
// them onto the structure. For the "Shared" treatment all three platform skins point
// at the same object, so these are the single source of truth for the one look.
export interface CodeBlockSkin {
  /** Shared code type (size / line-height) used by plain, numbered, and gutter text. */
  codeType: TextStyle;
  /** Code foreground color (token-driven so it follows light/dark). */
  codeText: (t: ColorTokens) => TextStyle;
  /** The muted, bordered, rounded code surface (plain + numbered base). */
  surface: (t: ColorTokens) => ViewStyle;
  /** Padding for the plain surface. */
  surfacePad: ViewStyle;
  /** Header strip carrying the filename/language label (plain + numbered). */
  headerBar: (t: ColorTokens) => ViewStyle;
  /** Header label type (the file/language name). */
  headerLabel: (t: ColorTokens) => TextStyle;
  /** Squares off the surface's top corners when a header bar sits above it. */
  surfaceUnderHeader: ViewStyle;
  /** The inline pill (short mid-sentence token). */
  inlineBox: (t: ColorTokens) => ViewStyle;
  /** Inline label type (its own smaller size). */
  inlineType: TextStyle;
  /** Terminal outer window: shape, border, shadow/elevation, clipping. */
  terminalOuter: (t: ColorTokens) => ViewStyle;
  /** Terminal chrome bar (dots + label). */
  terminalChrome: ViewStyle;
  /** A single traffic-light dot, keyed by hue. */
  trafficDot: (hue: "red" | "amber" | "green") => ViewStyle;
  /** Terminal chrome label type. */
  terminalLabel: TextStyle;
  /** Terminal body container. */
  terminalBody: ViewStyle;
  /** A single terminal command row. */
  terminalRow: ViewStyle;
  /** The non-selectable "$ " prompt. */
  terminalPrompt: TextStyle;
  /** The command line text. */
  terminalLine: TextStyle;
  /** The numbered surface (flex row + padding, on top of `surface`). */
  numberedSurface: ViewStyle;
  /** The right-aligned line-number gutter. */
  numberedGutter: ViewStyle;
  /** Dimmed line-number color. */
  gutterText: (t: ColorTokens) => TextStyle;
  /** The numbered code column. */
  numberedCodeCol: ViewStyle;
  /** The copy chip shape/fill (the `dark` flag picks the terminal vs surface chip). */
  copyButton: (t: ColorTokens, dark: boolean) => ViewStyle;
  /** The copy chip label. */
  copyText: (t: ColorTokens, dark: boolean) => TextStyle;
  /** Press dim opacity for the copy chip (iOS/web feedback). */
  copyPressedOpacity: number;
}

export interface CodeBlockProps {
  /** The code to render. Newlines are preserved (RN Text honors "\n"). */
  code?: string;
  /**
   * Optional filename label shown in a header bar above the surface. Honored by
   * the plain and numbered variants (and the terminal chrome label); the inline
   * pill has no header. When both are set, `filename` wins the header label and
   * `language` the terminal label.
   */
  filename?: string;
  /**
   * Optional language label shown in the header bar / terminal chrome. See
   * `filename` for which variant renders it.
   */
  language?: string;

  // Variant (pick one; default is the plain block).
  terminal?: boolean;
  numbered?: boolean;
  inline?: boolean;

  // Orthogonal modifiers.
  copy?: boolean;
  wrap?: boolean;

  /** Called when the copy affordance is pressed (text is passed back). */
  onCopy?: (code: string, event: GestureResponderEvent) => void;

  /** E2E hook forwarded to the root element. */
  testID?: string;

  /** Outer layout composition only (width/flex within a parent), never a restyle hook. */
  style?: StyleProp<ViewStyle>;
}

// Variant precedence when more than one is passed: first match wins.
function variantOf(p: CodeBlockProps): Variant {
  if (p.terminal) return "terminal";
  if (p.numbered) return "numbered";
  if (p.inline) return "inline";
  return "plain";
}

const DEFAULT_CODE = 'const theme = getTheme();\nsetTheme(theme === "dark" ? "light" : "dark");';

// relative wrapper for the absolutely-positioned copy chip.
const RELATIVE: ViewStyle = { position: "relative" };

export function createCodeBlock(skin: CodeBlockSkin) {
  // A small, neutral chip pinned to the top-right corner for the copy affordance.
  function CopyButton({
    text,
    onCopy,
    dark,
  }: {
    text: string;
    onCopy?: (code: string, event: GestureResponderEvent) => void;
    dark?: boolean;
  }) {
    const { tokens } = useTheme();
    const isDark = !!dark;
    // The bounded ripple is clipped to the rounded chip by the RippleClip parent (Android only; a
    // same-node overflow:"hidden" cannot clip it — see src/style/ripple-clip). The chip is absolutely
    // positioned, so its placement moves to the wrapper (a wrapper around an absolute child would
    // collapse to zero size and clip the ripple away). Its Android `elevation` also moves to the
    // wrapper (whose own shadow is unclipped by its child-overflow); the light chip's iOS `shadow*`
    // stays on the inner Pressable, so iOS is unchanged.
    const { position, top, end, zIndex, alignSelf, elevation, ...box } = StyleSheet.flatten(
      skin.copyButton(tokens, isDark),
    ) as ViewStyle & { elevation?: number };
    const { parent: elevParent } = splitElevation({ elevation });
    return (
      <RippleClip shape={cornerRadii(box)} style={[{ position, top, end, zIndex, alignSelf }, elevParent]}>
        <Pressable
          android_ripple={surfaceRipple(tokens)}
          style={({ pressed }) => [box, pressDim(pressed, skin.copyPressedOpacity)]}
          onPress={(e) => onCopy?.(text, e)}
          accessibilityRole="button"
          accessibilityLabel="Copy code"
        >
          <Text style={skin.copyText(tokens, isDark)}>Copy</Text>
        </Pressable>
      </RippleClip>
    );
  }

  // The header strip above plain/numbered surfaces, carrying the filename/language
  // label. Rendered only when a label is present.
  function Header({ label }: { label: string }) {
    const { tokens } = useTheme();
    return (
      <View style={skin.headerBar(tokens)}>
        <Text style={[skin.headerLabel(tokens), MONO]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    );
  }

  return function CodeBlock(props: CodeBlockProps) {
    const { code = DEFAULT_CODE, filename, language, copy, wrap, onCopy, testID, style } = props;
    const variant = variantOf(props);
    const { tokens } = useTheme();
    const lines = code.split("\n");
    // The header label for the plain/numbered variants: prefer the filename, fall
    // back to the language. Absent both, no header bar is rendered.
    const headerLabel = filename ?? language;

    // Inline: a short token rendered as an inline pill. No header, copy, or wrap.
    if (variant === "inline") {
      return (
        <View testID={testID} style={[skin.inlineBox(tokens), style]}>
          <Text style={[skin.codeText(tokens), MONO, skin.inlineType]}>{code}</Text>
        </View>
      );
    }

    // Terminal: a dark window with a chrome bar over a dark body.
    if (variant === "terminal") {
      const label = language ?? filename ?? "bash";
      return (
        <View testID={testID} style={[skin.terminalOuter(tokens), style]}>
          {/* Chrome bar: three traffic-light dots and a faint label. */}
          <View style={skin.terminalChrome}>
            <View style={skin.trafficDot("red")} />
            <View style={skin.trafficDot("amber")} />
            <View style={skin.trafficDot("green")} />
            <Text style={[skin.terminalLabel, MONO]}>{label}</Text>
          </View>
          {/* Body: each line gets a non-selectable "$ " prompt. */}
          <View style={skin.terminalBody}>
            {lines.map((line, i) => (
              <View key={i} style={skin.terminalRow}>
                <Text style={[skin.terminalPrompt, MONO]}>{"$ "}</Text>
                <Text style={[skin.terminalLine, MONO]} numberOfLines={wrap ? undefined : 1}>
                  {line}
                </Text>
              </View>
            ))}
          </View>
          {copy ? <CopyButton text={code} onCopy={onCopy} dark /> : null}
        </View>
      );
    }

    // Numbered: the plain surface with a right-aligned line-number gutter.
    if (variant === "numbered") {
      return (
        <View testID={testID} style={[RELATIVE, style]}>
          {headerLabel ? <Header label={headerLabel} /> : null}
          <View style={[skin.surface(tokens), headerLabel ? skin.surfaceUnderHeader : null, skin.numberedSurface]}>
            {/* Gutter: right-aligned, dimmed line numbers. */}
            <View style={skin.numberedGutter}>
              {lines.map((_, i) => (
                <Text key={i} style={[skin.codeType, skin.gutterText(tokens), MONO]}>
                  {String(i + 1)}
                </Text>
              ))}
            </View>
            {/* Code column: one Text per line so the gutter stays aligned. */}
            <View style={skin.numberedCodeCol}>
              {lines.map((line, i) => (
                <Text
                  key={i}
                  style={[skin.codeType, skin.codeText(tokens), MONO]}
                  numberOfLines={wrap ? undefined : 1}
                >
                  {line}
                </Text>
              ))}
            </View>
          </View>
          {copy ? <CopyButton text={code} onCopy={onCopy} /> : null}
        </View>
      );
    }

    // Plain (default): the muted code surface, padded, monospace.
    return (
      <View testID={testID} style={[RELATIVE, style]}>
        {headerLabel ? <Header label={headerLabel} /> : null}
        <View style={[skin.surface(tokens), headerLabel ? skin.surfaceUnderHeader : null, skin.surfacePad]}>
          <Text
            style={[skin.codeType, skin.codeText(tokens), MONO]}
            numberOfLines={wrap ? undefined : lines.length}
          >
            {code}
          </Text>
        </View>
        {copy ? <CopyButton text={code} onCopy={onCopy} /> : null}
      </View>
    );
  };
}
