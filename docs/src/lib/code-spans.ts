// A Do/Don't caption or title comes from a component's .md as a line of Markdown, and the
// one inline construct the pages use there is the code span (`cover`, `onPress`). This
// splits such a line into its text and code runs the way CommonMark reads code spans, so
// the page can set the code in the mono face instead of printing the backticks: a run of
// n backticks opens a span that the next run of exactly n backticks closes, a run with no
// such match is literal text, and a span whose content starts and ends with a space (and
// is not all spaces) loses one space at each end, so `` `a` `` shows `a` with its ticks.

export type InlineRun = { text: string; code: boolean };

// The length of the backtick run starting at `at`.
function runLength(line: string, at: number): number {
  let n = 0;
  while (line[at + n] === "`") n++;
  return n;
}

export function splitCodeSpans(line: string): InlineRun[] {
  const runs: InlineRun[] = [];
  let text = "";
  let i = 0;
  while (i < line.length) {
    if (line[i] !== "`") {
      text += line[i++];
      continue;
    }
    const n = runLength(line, i);
    // The closing run: the next run of exactly n backticks, longer or shorter runs inside
    // the span being part of its content.
    let close = -1;
    for (let j = i + n; j < line.length; ) {
      if (line[j] !== "`") { j++; continue; }
      const m = runLength(line, j);
      if (m === n) { close = j; break; }
      j += m;
    }
    if (close === -1) {
      text += line.slice(i, i + n);
      i += n;
      continue;
    }
    let code = line.slice(i + n, close).replace(/\n/g, " ");
    if (code.length > 1 && code.startsWith(" ") && code.endsWith(" ") && code.trim() !== "") code = code.slice(1, -1);
    if (text) runs.push({ text, code: false });
    runs.push({ text: code, code: true });
    text = "";
    i = close + n;
  }
  if (text) runs.push({ text, code: false });
  return runs;
}
