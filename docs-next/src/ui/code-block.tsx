import { useState } from "react";
import { Platform } from "react-native";
import { ScrollView, View, Text, Pressable, useTheme, palette } from "@olympusoss/canvas";
import { MONO } from "./prose";
import { geist } from "./fonts";

// A token-themed TSX highlighter standing in for Shiki (which emits HTML and can't run
// on native). Colors approximate github-dark/light. Matches `.docs-code-wrap`: bordered,
// radius-lg, pre padding 16/20 at 13px/1.6 on the muted surface, with a Copy button.
const KEYWORDS = new Set([
  "const", "let", "var", "return", "function", "import", "from", "export",
  "true", "false", "null", "undefined", "await", "async", "new", "if", "else",
]);
const TOKEN_RE =
  /(\/\/[^\n]*|<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(<\/?[A-Za-z][\w.]*)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;

function useSyntaxColors() {
  const { tokens, dark } = useTheme();
  return {
    text: tokens.foreground,
    comment: tokens["muted-foreground"],
    string: dark ? palette["green-400"] : palette["green-700"],
    tag: dark ? palette["sky-400"] : palette["sky-700"],
    number: dark ? palette["amber-400"] : palette["amber-700"],
    keyword: dark ? palette["violet-400"] : palette["violet-700"],
  };
}

export function CodeBlock({ code, flush }: { code: string; flush?: boolean }) {
  const { tokens } = useTheme();
  const c = useSyntaxColors();
  const [copied, setCopied] = useState(false);

  const spans: { text: string; color: string }[] = [];
  let last = 0;
  for (const m of code.matchAll(TOKEN_RE)) {
    const i = m.index ?? 0;
    if (i > last) spans.push({ text: code.slice(last, i), color: c.text });
    let color = c.text;
    if (m[1]) color = c.comment;
    else if (m[2]) color = c.string;
    else if (m[3]) color = c.tag;
    else if (m[4]) color = c.number;
    else if (m[5]) color = KEYWORDS.has(m[5]) ? c.keyword : c.text;
    spans.push({ text: m[0], color });
    last = i + m[0].length;
  }
  if (last < code.length) spans.push({ text: code.slice(last), color: c.text });

  const copy = () => {
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      });
    }
  };

  return (
    <View
      style={{
        borderWidth: 1,
        borderTopWidth: flush ? 0 : 1,
        borderColor: tokens.border,
        borderRadius: 12,
        borderTopLeftRadius: flush ? 0 : 12,
        borderTopRightRadius: flush ? 0 : 12,
        backgroundColor: tokens.muted,
        overflow: "hidden",
      }}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 20 }}>
        <Text style={{ fontFamily: MONO, fontSize: 13, lineHeight: 20.8 }}>
          {spans.map((s, i) => (
            <Text key={i} style={{ color: s.color }}>
              {s.text}
            </Text>
          ))}
        </Text>
      </ScrollView>
      <Pressable
        onPress={copy}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          paddingVertical: 4,
          paddingHorizontal: 8,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: tokens.border,
          backgroundColor: tokens.card,
        }}
      >
        <Text style={{ fontFamily: geist("500"), fontSize: 11, color: tokens["muted-foreground"] }}>{copied ? "Copied" : "Copy"}</Text>
      </Pressable>
    </View>
  );
}
