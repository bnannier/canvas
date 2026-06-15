import { type GestureResponderEvent } from "react-native";
import { View, Pressable, Text, useTheme, surfaceRipple, pressDim, type StyleProp, type ViewStyle } from "../../style/index.js";
import * as s from "./code-block.styles.js";
import { type Variant } from "./code-block.styles.js";

// CodeBlock: a muted, rounded surface that shows preformatted code in a
// monospace face. Newlines in `code` survive verbatim because RN Text honors
// "\n", so a multi-line string renders as multiple lines without any markup.
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Badge's toneOf). Axes:
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
// `style={s.MONO}` on each code Text (the same approach Badge's `mono` uses).

export interface CodeBlockProps {
  /** The code to render. Newlines are preserved (RN Text honors "\n"). */
  code?: string;
  /** Optional filename or language label for the header bar. */
  filename?: string;
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

  /** Escape hatch for layout/positioning composition (mainly width, margins). */
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
  return (
    <Pressable
      android_ripple={surfaceRipple(tokens)}
      style={({ pressed }) => [s.copyButton(tokens, isDark), pressDim(pressed, 0.8)]}
      onPress={(e) => onCopy?.(text, e)}
      accessibilityRole="button"
      accessibilityLabel="Copy code"
    >
      <Text style={s.copyText(tokens, isDark)}>Copy</Text>
    </Pressable>
  );
}

export function CodeBlock(props: CodeBlockProps) {
  const { code = DEFAULT_CODE, filename, language, copy, wrap, onCopy, style } = props;
  const variant = variantOf(props);
  const { tokens } = useTheme();
  const lines = code.split("\n");

  // Inline: a short token rendered as an inline pill. No header, copy, or wrap.
  if (variant === "inline") {
    return (
      <View style={[s.inlineBox(tokens), style]}>
        <Text style={[s.codeText(tokens), s.MONO, { fontSize: 13 }]}>{code}</Text>
      </View>
    );
  }

  // Terminal: a dark window with a chrome bar over a dark body.
  if (variant === "terminal") {
    const label = language ?? filename ?? "bash";
    return (
      <View style={[s.terminalOuter(tokens), style]}>
        {/* Chrome bar: three traffic-light dots and a faint label. */}
        <View style={s.terminalChrome}>
          <View style={s.trafficDot("red")} />
          <View style={s.trafficDot("amber")} />
          <View style={s.trafficDot("green")} />
          <Text style={[s.terminalLabel, s.MONO]}>{label}</Text>
        </View>
        {/* Body: each line gets a non-selectable "$ " prompt. */}
        <View style={s.terminalBody}>
          {lines.map((line, i) => (
            <View key={i} style={s.terminalRow}>
              <Text style={[s.terminalPrompt, s.MONO]}>{"$ "}</Text>
              <Text style={[s.terminalLine, s.MONO]} numberOfLines={wrap ? undefined : 1}>
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
      <View style={[s.relative, style]}>
        <View style={[s.surface(tokens), s.numberedSurface]}>
          {/* Gutter: right-aligned, dimmed line numbers. */}
          <View style={s.numberedGutter}>
            {lines.map((_, i) => (
              <Text key={i} style={[s.codeType, s.gutterText(tokens), s.MONO]}>
                {String(i + 1)}
              </Text>
            ))}
          </View>
          {/* Code column: one Text per line so the gutter stays aligned. */}
          <View style={s.numberedCodeCol}>
            {lines.map((line, i) => (
              <Text
                key={i}
                style={[s.codeType, s.codeText(tokens), s.MONO]}
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
    <View style={[s.relative, style]}>
      <View style={[s.surface(tokens), s.surfacePad]}>
        <Text
          style={[s.codeType, s.codeText(tokens), s.MONO]}
          numberOfLines={wrap ? undefined : lines.length}
        >
          {code}
        </Text>
      </View>
      {copy ? <CopyButton text={code} onCopy={onCopy} /> : null}
    </View>
  );
}
