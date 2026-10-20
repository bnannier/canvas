/** Safe Markdown document grammar shared with Chat. Source never becomes HTML. */
export interface MarkdownBlock {
  kind: "paragraph" | "heading" | "code" | "quote" | "list" | "table" | "rule";
  text: string;
  marker?: string;
  level?: number;
  indent?: number;
  checked?: boolean;
  columns?: string[];
  rows?: string[][];
}

function tableCells(line: string): string[] {
  const cells: string[] = [];
  let cell = "", fence = 0;
  const source = line.trim();
  for (let index = 0; index < source.length; index++) {
    const char = source[index];
    if (char === "\\" && source[index + 1] === "|") { cell += "|"; index++; continue; }
    if (char === "`") {
      let count = 1;
      while (source[index + count] === "`") count++;
      if (!fence) fence = count; else if (fence === count) fence = 0;
      cell += "`".repeat(count); index += count - 1; continue;
    }
    if (char === "|" && !fence) { cells.push(cell.trim()); cell = ""; }
    else cell += char;
  }
  cells.push(cell.trim());
  if (!cells[0] && source.startsWith("|")) cells.shift();
  if (!cells[cells.length - 1] && source.endsWith("|")) cells.pop();
  return cells;
}

export function markdownBlocks(source: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  let paragraph: string[] = [], code: string[] | null = null, fence = "";
  const flush = () => { if (paragraph.length) blocks.push({ kind: "paragraph", text: paragraph.join("\n") }); paragraph = []; };
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]!;
    const boundary = /^\s{0,3}(`{3,}|~{3,})/.exec(line);
    if (code != null) {
      if (boundary && boundary[1][0] === fence[0] && boundary[1].length >= fence.length && !line.slice(boundary[0].length).trim()) { blocks.push({ kind: "code", text: code.join("\n") }); code = null; }
      else code.push(line);
      continue;
    }
    if (boundary) { flush(); code = []; fence = boundary[1]; continue; }
    if (!line.trim()) { flush(); continue; }
    const next = lines[index + 1];
    if (line.includes("|") && next && tableCells(next).length === tableCells(line).length && tableCells(next).every(cell => /^:?-{3,}:?$/.test(cell))) {
      flush(); const columns = tableCells(line), rows: string[][] = []; index++;
      while (lines[index + 1]?.trim() && lines[index + 1].includes("|")) rows.push(tableCells(lines[++index]));
      blocks.push({ kind: "table", text: "", columns, rows }); continue;
    }
    if (/^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { flush(); blocks.push({ kind: "rule", text: "" }); continue; }
    const heading = /^\s{0,3}(#{1,6})\s+(.+?)(?:\s+#+)?\s*$/.exec(line);
    const list = /^(\s*)(?:([-*+])|(\d+)[.)])\s+(.+)$/.exec(line);
    const quote = /^\s{0,3}>\s?(.*)$/.exec(line);
    if (heading || list || quote) {
      flush();
      if (heading) blocks.push({ kind: "heading", text: heading[2], level: heading[1].length });
      else if (list) {
        const task = /^\[([ xX])\]\s+(.*)$/.exec(list[4]);
        blocks.push({ kind: "list", marker: list[3] ? `${list[3]}.` : "•", text: task ? task[2] : list[4],
          ...(list[1] ? { indent: Math.min(6, Math.floor(list[1].replace(/\t/g, "    ").length / 2)) } : {}),
          ...(task ? { checked: task[1].toLowerCase() === "x" } : {}) });
      } else blocks.push({ kind: "quote", text: quote![1] });
    } else paragraph.push(line);
  }
  flush();
  if (code != null) blocks.push({ kind: "code", text: code.join("\n") });
  return blocks;
}

export interface MarkdownRun { text: string; strong?: boolean; emphasis?: boolean; code?: boolean }
export function markdownRuns(source: string): MarkdownRun[] {
  const runs: MarkdownRun[] = [];
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
