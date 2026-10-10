// The inline Markdown a component's .md prose is written in, read one way by the docs
// generator (tools/docgen/parse-md.ts, which holds every page to it) and by the page that
// renders it (docs/src/ui/prose.tsx). The pages use three inline constructs: the code span
// (`cover`, `onPress`), set in the mono face; strong text (**Color**); and the backslash
// escape (\* for a literal asterisk). Everything else Markdown has inline (emphasis, a
// link, an image, raw HTML) has no renderer here, so `unsupportedInline` names it and the
// generator refuses the page rather than print the syntax as text.
//
// The code span reads as CommonMark reads it: a run of n backticks opens a span that the
// next run of exactly n backticks closes, a run with no such match is literal text, a
// backslash does not escape inside a span, and a span whose content starts and ends with
// a space (and is not all spaces) loses one space at each end, so `` `a` `` shows `a`
// with its ticks. Strong is a `**` that a non-space follows, closed by the next `**` that
// a non-space precedes; it may hold code spans. Outside a code span a backslash before
// ASCII punctuation is that character, literally.

export type InlineRun = { text: string; code: boolean; strong: boolean };

const ASCII_PUNCTUATION = /[!-/:-@[-`{-~]/;

// The length of the backtick run starting at `at`.
function runLength(line: string, at: number): number {
  let n = 0;
  while (line[at + n] === "`") n++;
  return n;
}

// Where the code span opening with the n-backtick run at `at` closes: the start of the
// next run of exactly n backticks, longer or shorter runs inside the span being part of
// its content; -1 when nothing closes it.
function codeSpanClose(line: string, at: number, n: number): number {
  for (let j = at + n; j < line.length; ) {
    if (line[j] !== "`") { j++; continue; }
    const m = runLength(line, j);
    if (m === n) return j;
    j += m;
  }
  return -1;
}

// The `**` that closes a strong run opened before `from`: one that a non-space precedes,
// outside a code span and not escaped; -1 when nothing closes it.
function strongClose(line: string, from: number): number {
  for (let j = from; j < line.length; ) {
    const c = line[j];
    if (c === "\\" && ASCII_PUNCTUATION.test(line[j + 1] ?? "")) { j += 2; continue; }
    if (c === "`") {
      const n = runLength(line, j);
      const close = codeSpanClose(line, j, n);
      j = close === -1 ? j + n : close + n;
      continue;
    }
    if (line.startsWith("**", j) && j > from && !/\s/.test(line[j - 1])) return j;
    j++;
  }
  return -1;
}

function codeOf(raw: string): string {
  let code = raw.replace(/\n/g, " ");
  if (code.length > 1 && code.startsWith(" ") && code.endsWith(" ") && code.trim() !== "") code = code.slice(1, -1);
  return code;
}

/** A line of inline Markdown as its runs: text, code spans and strong text, in order. */
export function parseInline(line: string): InlineRun[] {
  const runs: InlineRun[] = [];
  const push = (text: string, code: boolean, strong: boolean) => {
    if (text === "") return;
    const last = runs[runs.length - 1];
    if (last && !code && !last.code && last.strong === strong) last.text += text;
    else runs.push({ text, code, strong });
  };
  // Reads line[from, to) into runs, every run strong when `strong` is set.
  const read = (from: number, to: number, strong: boolean) => {
    let i = from;
    while (i < to) {
      const c = line[i];
      if (c === "\\" && i + 1 < to && ASCII_PUNCTUATION.test(line[i + 1])) {
        push(line[i + 1], false, strong);
        i += 2;
        continue;
      }
      if (c === "`") {
        const n = runLength(line, i);
        const close = codeSpanClose(line.slice(0, to), i, n);
        if (close === -1) {
          push(line.slice(i, i + n), false, strong);
          i += n;
        } else {
          push(codeOf(line.slice(i + n, close)), true, strong);
          i = close + n;
        }
        continue;
      }
      if (!strong && line.startsWith("**", i) && i + 2 < to && !/\s/.test(line[i + 2])) {
        const close = strongClose(line.slice(0, to), i + 2);
        if (close !== -1) {
          read(i + 2, close, true);
          i = close + 2;
          continue;
        }
      }
      push(c, false, strong);
      i++;
    }
  };
  read(0, line.length, false);
  return runs;
}

/** The text a reader sees: the runs joined, with no Markdown syntax left (for search). */
export function inlineText(line: string): string {
  return parseInline(line).map((run) => run.text).join("");
}

// A line's syntax outside its code spans: each span becomes one NUL and each backslash
// escape one SOH, so neither a bracket or a star inside a span nor an escaped one is read
// as a construct below.
function outsideCode(line: string): string {
  let out = "";
  for (let i = 0; i < line.length; ) {
    const c = line[i];
    if (c === "\\" && ASCII_PUNCTUATION.test(line[i + 1] ?? "")) { out += "\u0001"; i += 2; continue; }
    if (c === "`") {
      const n = runLength(line, i);
      const close = codeSpanClose(line, i, n);
      out += close === -1 ? line.slice(i, i + n) : "\u0000";
      i = close === -1 ? i + n : close + n;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

// The inline constructs Markdown has that the page does not render.
const UNSUPPORTED: [RegExp, string][] = [
  [/!\[[^\]]*\]\([^)]*\)/, "an image"],
  [/(?<!!)\[[^\]]+\]\([^)]*\)/, "a link"],
  [/<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^>]*)?\/?>|<https?:[^>\s]+>/, "raw HTML or an autolink"],
  // Emphasis: a single star or underscore that a non-space follows, closed by the same
  // delimiter that a non-space precedes (a `**` pair is strong, which renders). An
  // underscore inside a word (snake_case) opens nothing, as CommonMark reads it.
  [/(?:^|[^*])\*(?![\s*])(?:[^*]*?[^\s*])?\*(?!\*)/, "emphasis (a single *)"],
  [/(?:^|[^\p{L}\p{N}_])_(?![\s_])(?:[^_]*?[^\s_])?_(?![\p{L}\p{N}_])/u, "emphasis (a single _)"],
];

/**
 * The inline constructs in a line of Markdown that the docs page would print as text: an
 * image, a link, raw HTML, emphasis. Empty when every construct in it renders.
 */
export function unsupportedInline(line: string): string[] {
  const syntax = outsideCode(line);
  return UNSUPPORTED.filter(([pattern]) => pattern.test(syntax)).map(([, what]) => what);
}
