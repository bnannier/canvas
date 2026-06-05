import { type GestureResponderEvent } from "react-native";
import { cn } from "../cn.js";
import { Box, Pressable, Text } from "../engine/index.js";

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
// The engine has no font-mono utility, so the monospace face is requested via
// an inline `style={{ fontFamily: "monospace" }}` on each code Text (the same
// approach Badge's `mono` modifier uses).

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

  className?: string;
}

type Variant = "terminal" | "numbered" | "inline" | "plain";

// Variant precedence when more than one is passed: first match wins.
function variantOf(p: CodeBlockProps): Variant {
  if (p.terminal) return "terminal";
  if (p.numbered) return "numbered";
  if (p.inline) return "inline";
  return "plain";
}

const DEFAULT_CODE = 'const theme = getTheme();\nsetTheme(theme === "dark" ? "light" : "dark");';

// Monospace face: requested inline since the engine has no font-mono utility.
const MONO = { fontFamily: "monospace" } as const;

// The shared code surface: a muted, bordered, rounded card with comfortable
// padding (mirrors the docs codeblockCls, minus the web-only font-mono/overflow).
const SURFACE = "w-full self-start rounded-lg border border-border bg-muted/50";
const CODE_TEXT = "text-foreground";
const CODE_TYPE = "text-sm leading-relaxed";

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
  return (
    <Pressable
      className={cn(
        "absolute right-2 top-2 z-10 flex-row items-center self-start rounded-md border px-2.5 py-1 active:opacity-80",
        dark
          ? "border-zinc-700 bg-zinc-800"
          : "border-border bg-background shadow-sm",
      )}
      onPress={(e) => onCopy?.(text, e)}
      accessibilityRole="button"
      accessibilityLabel="Copy code"
    >
      <Text className={cn("text-xs font-medium", dark ? "text-zinc-300" : "text-muted-foreground")}>
        Copy
      </Text>
    </Pressable>
  );
}

export function CodeBlock(props: CodeBlockProps) {
  const { code = DEFAULT_CODE, filename, language, copy, wrap, onCopy, className } = props;
  const variant = variantOf(props);
  const lines = code.split("\n");

  // Inline: a short token rendered as an inline pill. No header, copy, or wrap.
  if (variant === "inline") {
    return (
      <Box className={cn("self-start rounded border border-border bg-muted px-1.5 py-0.5", className)}>
        <Text className="text-foreground" style={[MONO, { fontSize: 13 }]}>
          {code}
        </Text>
      </Box>
    );
  }

  // Terminal: a dark window with a chrome bar over a dark body.
  if (variant === "terminal") {
    const label = language ?? filename ?? "bash";
    return (
      <Box className={cn("relative w-full self-start overflow-hidden rounded-lg border border-border shadow-sm", className)}>
        {/* Chrome bar: three traffic-light dots and a faint label. */}
        <Box className="flex-row items-center gap-1.5 border-b border-zinc-700 bg-zinc-800 px-4 py-2.5">
          <Box className="h-3 w-3 rounded-full bg-red-500" />
          <Box className="h-3 w-3 rounded-full bg-amber-500" />
          <Box className="h-3 w-3 rounded-full bg-green-500" />
          <Text className="ml-2 text-xs text-zinc-400" style={MONO}>
            {label}
          </Text>
        </Box>
        {/* Body: each line gets a non-selectable "$ " prompt. */}
        <Box className="bg-zinc-900 p-4">
          {lines.map((line, i) => (
            <Box key={i} className="flex-row">
              <Text className="text-emerald-400" style={MONO}>
                {"$ "}
              </Text>
              <Text
                className="flex-1 text-zinc-100"
                style={MONO}
                numberOfLines={wrap ? undefined : 1}
              >
                {line}
              </Text>
            </Box>
          ))}
        </Box>
        {copy ? <CopyButton text={code} onCopy={onCopy} dark /> : null}
      </Box>
    );
  }

  // Numbered: the plain surface with a right-aligned line-number gutter.
  if (variant === "numbered") {
    return (
      <Box className={cn("relative", className)}>
        <Box className={cn(SURFACE, "flex-row p-4")}>
          {/* Gutter: right-aligned, dimmed line numbers. */}
          <Box className="mr-4 items-end">
            {lines.map((_, i) => (
              <Text key={i} className={cn(CODE_TYPE, "text-muted-foreground")} style={MONO}>
                {String(i + 1)}
              </Text>
            ))}
          </Box>
          {/* Code column: one Text per line so the gutter stays aligned. */}
          <Box className="flex-1">
            {lines.map((line, i) => (
              <Text
                key={i}
                className={cn(CODE_TYPE, CODE_TEXT)}
                style={MONO}
                numberOfLines={wrap ? undefined : 1}
              >
                {line}
              </Text>
            ))}
          </Box>
        </Box>
        {copy ? <CopyButton text={code} onCopy={onCopy} /> : null}
      </Box>
    );
  }

  // Plain (default): the muted code surface, padded, monospace.
  return (
    <Box className={cn("relative", className)}>
      <Box className={cn(SURFACE, "p-4")}>
        <Text
          className={cn(CODE_TYPE, CODE_TEXT)}
          style={MONO}
          numberOfLines={wrap ? undefined : lines.length}
        >
          {code}
        </Text>
      </Box>
      {copy ? <CopyButton text={code} onCopy={onCopy} /> : null}
    </Box>
  );
}
