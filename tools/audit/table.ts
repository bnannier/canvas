// One reader for every markdown table the audit reads: the checklists' variants,
// findings and sign-off tables, and the catalog in PLATFORM-REFERENCES.md. A row is split
// on its unescaped pipes only (a pipe after a backslash is cell text, the way the
// checklists write one), a free-text column keeps any extra "|" a reviewer typed in it,
// a row may leave off its closing pipe and its trailing optional cells, and a row that
// cannot be read is returned with its line number and the reason, never dropped.

export interface TableShape {
  /** What a message calls the table: "variants", "findings", "sign-off". */
  name: string;
  /** The column headings, in order, as the header row spells them. */
  columns: readonly string[];
  /** The fewest cells a row may have; the cells after that read as empty when left off. */
  minCells: number;
  /** The free-text column that keeps the extra cells a "|" typed in it makes, if the table has one. */
  free?: number;
}

/** A line that is not a readable row, and why. */
export interface MalformedRow {
  line: number;
  reason: string;
}

/** A readable row: its cells, one per column, trimmed, and its 1-based line in the file. */
export interface TableRow {
  cells: string[];
  line: number;
}

/** A table's separator row: `|---|:---:|`. */
export const SEPARATOR_LINE = /^\|(\s*:?-+:?\s*\|)+$/;

/** The header row a shape is written with. */
export function headerRow(shape: TableShape): string {
  return `| ${shape.columns.join(" | ")} |`;
}

/** The separator row under a shape's header. */
export function separatorRow(shape: TableShape): string {
  return `|${shape.columns.map(() => "---|").join("")}`;
}

/** The offsets of a line's unescaped pipes: a pipe right after a backslash is cell text. */
export function pipeOffsets(line: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < line.length; i++) if (line[i] === "|" && line[i - 1] !== "\\") out.push(i);
  return out;
}

/** A row's cells, one per column, or the reason the row cannot be read. */
export function splitRow(text: string, shape: TableShape): { cells: string[] } | { reason: string } {
  const line = text.trim();
  const pipes = pipeOffsets(line);
  if (pipes[0] !== 0) return { reason: `not a table row (a ${shape.name} row starts with \`|\`)` };
  // A row may leave off its closing pipe: its last cell then runs to the end of the line.
  const closed = pipes.length > 1 && pipes[pipes.length - 1] === line.length - 1;
  const bounds = closed ? pipes : [...pipes, line.length];
  const raw = bounds.slice(0, -1).map((at, i) => line.slice(at + 1, bounds[i + 1]));
  if (raw.length < shape.minCells) return { reason: `too few cells (a ${shape.name} row is \`${headerRow(shape)}\`)` };
  const extra = raw.length - shape.columns.length;
  let cells = raw;
  if (extra > 0) {
    if (shape.free === undefined) {
      return { reason: `${raw.length} cells where the table has ${shape.columns.length} (write a pipe inside a cell as \`\\|\`)` };
    }
    // The free cell runs from its own opening pipe to the pipe that opens the cell after
    // it, so every "|" typed inside it stays in it.
    const free = line.slice(bounds[shape.free] + 1, bounds[shape.free + 1 + extra]);
    cells = [...raw.slice(0, shape.free), free, ...raw.slice(shape.free + 1 + extra)];
  }
  while (cells.length < shape.columns.length) cells.push("");
  return { cells: cells.map((cell) => cell.trim()) };
}

/** A table under a `## heading` section: whether its header was found, its rows, and the lines it could not read. */
export interface SectionTable {
  found: boolean;
  rows: TableRow[];
  malformed: MalformedRow[];
}

/**
 * The table in a markdown section (`## <heading>` up to the next `#` or `##` heading),
 * written in the given shape. The prose before it is skipped; its first row must be the
 * shape's header and its second a separator. The table ends at the first blank line, as
 * markdown ends one, so a row typed after that blank line would not render in the table
 * and is reported rather than counted. Every other table line that cannot be read is
 * reported with its line number.
 */
export function readSectionTable(content: string, heading: string, shape: TableShape): SectionTable {
  const table: SectionTable = { found: false, rows: [], malformed: [] };
  const lines = content.split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) return table;
  let state: "before" | "separator" | "body" | "after" = "before";
  let headerLine = 0;
  for (let i = start + 1; i < lines.length; i++) {
    const text = lines[i].trim();
    if (/^#{1,2} /.test(text)) break;
    const line = i + 1;
    if (state === "before") {
      if (!text.startsWith("|")) continue;
      const header = splitRow(text, { ...shape, minCells: shape.columns.length, free: undefined });
      const expected = shape.columns.map((c) => c.toLowerCase());
      if ("reason" in header || header.cells.map((c) => c.toLowerCase()).join("|") !== expected.join("|")) {
        table.malformed.push({ line, reason: `the ${shape.name} header reads \`${text}\`, not \`${headerRow(shape)}\`, so its rows cannot be read; restore the header` });
        return table;
      }
      table.found = true;
      headerLine = line;
      state = "separator";
    } else if (state === "separator") {
      if (!SEPARATOR_LINE.test(text)) {
        table.malformed.push({ line, reason: `the ${shape.name} header is not followed by a separator row (\`${separatorRow(shape)}\`), so the table does not render` });
        return table;
      }
      state = "body";
    } else if (state === "body") {
      if (!text) {
        state = "after";
        continue;
      }
      const split = splitRow(text, shape);
      if ("reason" in split) table.malformed.push({ line, reason: split.reason });
      else table.rows.push({ cells: split.cells, line });
    } else if (text.startsWith("|")) {
      table.malformed.push({ line, reason: `a ${shape.name} row below the blank line that ends the table, so it does not render as a row; remove the blank line above it` });
    }
  }
  if (state === "separator") table.malformed.push({ line: headerLine, reason: `the ${shape.name} header has no separator row under it` });
  return table;
}
