import { ScrollView, View, Text, useTheme, palette } from "@olympusoss/canvas";
import { MONO } from "./prose";

// The web docs highlight code with Shiki (emits HTML), which can't run on native. This
// is a small TSX tokenizer that colors strings, comments, JSX tag names, numbers, and a
// few keywords — enough to make example source readable on a device, themed from tokens.
const KEYWORDS = new Set([
  "const", "let", "var", "return", "function", "import", "from", "export",
  "true", "false", "null", "undefined", "await", "async", "new", "if", "else",
]);

const TOKEN_RE =
  /(\/\/[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(<\/?[A-Za-z][\w.]*)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;

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

export function CodeBlock({ code }: { code: string }) {
  const { tokens } = useTheme();
  const c = useSyntaxColors();

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

  return (
    <View
      style={{
        borderRadius: 10,
        borderWidth: 1,
        borderColor: tokens.border,
        backgroundColor: tokens.muted,
        overflow: "hidden",
      }}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 14 }}>
        <Text style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 20 }}>
          {spans.map((s, i) => (
            <Text key={i} style={{ color: s.color }}>
              {s.text}
            </Text>
          ))}
        </Text>
      </ScrollView>
    </View>
  );
}
