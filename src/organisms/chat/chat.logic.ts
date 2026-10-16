/** A deliberately small markdown grammar: source text never becomes HTML. */
export interface ChatBlock {
  kind: "paragraph" | "heading" | "code" | "quote" | "list";
  text: string;
  marker?: string;
}

export function chatBlocks(source: string): ChatBlock[] {
  const blocks: ChatBlock[] = [];
  let paragraph: string[] = [];
  let code: string[] | null = null;
  const flush = () => {
    if (paragraph.length) blocks.push({ kind: "paragraph", text: paragraph.join("\n") });
    paragraph = [];
  };
  for (const line of source.replace(/\r\n?/g, "\n").split("\n")) {
    if (/^\s*```/.test(line)) {
      flush();
      if (code == null) code = [];
      else { blocks.push({ kind: "code", text: code.join("\n") }); code = null; }
      continue;
    }
    if (code != null) { code.push(line); continue; }
    if (!line.trim()) { flush(); continue; }
    const heading = /^#{1,6}\s+(.+)$/.exec(line);
    const list = /^\s*(?:([-*+])|(\d+)\.)\s+(.+)$/.exec(line);
    const quote = /^>\s?(.*)$/.exec(line);
    if (heading || list || quote) {
      flush();
      if (heading) blocks.push({ kind: "heading", text: heading[1] });
      else if (list) blocks.push({ kind: "list", marker: list[2] ? `${list[2]}.` : "•", text: list[3] });
      else blocks.push({ kind: "quote", text: quote![1] });
    } else paragraph.push(line);
  }
  flush();
  // An incomplete fence remains useful while the assistant streams its answer.
  if (code != null) blocks.push({ kind: "code", text: code.join("\n") });
  return blocks;
}

export interface ChatRun { text: string; strong?: boolean; emphasis?: boolean; code?: boolean }
export function chatRuns(source: string): ChatRun[] {
  const runs: ChatRun[] = [];
  const pattern = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g;
  let cursor = 0;
  for (const match of source.matchAll(pattern)) {
    const start = match.index!;
    if (start > cursor) runs.push({ text: source.slice(cursor, start) });
    const raw = match[0];
    if (raw.startsWith("`")) runs.push({ text: raw.slice(1, -1), code: true });
    else if (raw.startsWith("**")) runs.push({ text: raw.slice(2, -2), strong: true });
    else runs.push({ text: raw.slice(1, -1), emphasis: true });
    cursor = start + raw.length;
  }
  if (cursor < source.length) runs.push({ text: source.slice(cursor) });
  return runs;
}

/** Tail-following tolerates rounding while leaving a reader's older position alone. */
export function chatAtBottom(offset: number, viewport: number, content: number): boolean {
  return content - viewport - offset <= 48;
}
