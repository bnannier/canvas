// The one reader of the platform reference catalog (PLATFORM-REFERENCES.md): its table's
// rows, each native cell classified as a cited control, a `(none: ...)` note or plain text,
// and the row a docs component maps to. Every reader of the catalog goes through it: the
// audit facts (tools/audit/facts.ts), the shape gate (test/design-rules-shape.test.ts),
// the docs coverage report (scripts/check-docs-coverage.ts) and the catalog guard
// (test/platform-references.test.ts), so they cannot disagree about which row a component
// has. Two readers once did: the coverage report stripped names its own way, with no
// aliases and no charts row, and counted 48 row-less components where the audit counted 18.

import type { Category } from "../../docs/src/core/data/types.ts";
import { splitRow, type TableShape } from "../audit/table.ts";

export interface ReferenceCell {
  /** A real reference link, a `(none: ...)` note stating the platform has no such control, or plain text. */
  kind: "link" | "none" | "text";
  text: string;
  url?: string;
  /** The trailing parenthetical after a link, when the row carries one. */
  note?: string;
}

export interface ReferenceRow {
  /** The first word of the Component cell: the key a slug is matched against. */
  key: string;
  component: string;
  treatment: string;
  build: string;
  ios: ReferenceCell;
  android: ReferenceCell;
  web: ReferenceCell;
  /** The row's 1-based line in the catalog, for messages. */
  line: number;
}

/**
 * Slugs whose reference row is keyed under another name: the kit's `Stepper` is the
 * catalog's `stepper-control` (the +/- control, not the wizard), `Emblem` is the
 * `icon-tile` composite, and `Drawer` is the `overlays` row (sheets and side sheets).
 * Every chart shares the one `charts` row.
 */
export const REFERENCE_ROW_ALIASES: Record<string, string> = { stepper: "stepper-control", emblem: "icon-tile", drawer: "overlays" };

/** A cell's kind: a link with its optional trailing note, a `(none: ...)` note, or plain text. */
export function classifyCell(cell: string): ReferenceCell {
  const text = cell.trim();
  const none = /^\(none:\s*([\s\S]*)\)$/.exec(text);
  if (none) return { kind: "none", text: none[1].trim() };
  const link = /^\[([^\]]+)\]\((<[^>]+>|[^)]+)\)\s*([\s\S]*)$/.exec(text);
  if (link) {
    const url = link[2].replace(/^<|>$/g, "");
    const note = link[3].trim().replace(/^\(|\)$/g, "");
    return note ? { kind: "link", text: link[1], url, note } : { kind: "link", text: link[1], url };
  }
  return { kind: "text", text };
}

/** The catalog's table, read with the one table reader every audit table goes through. */
const REFERENCE_SHAPE: TableShape = { name: "PLATFORM-REFERENCES.md", columns: ["Component", "Treatment", "Build", "iOS", "Android", "Web"], minCells: 6 };

/** Every row of the catalog's table in `PLATFORM-REFERENCES.md`. */
export function referenceRows(markdown: string): ReferenceRow[] {
  const rows: ReferenceRow[] = [];
  markdown.split("\n").forEach((line, i) => {
    if (!line.startsWith("| ") || /^\|\s*Component\s*\|/.test(line) || /^\|-+\|/.test(line.replace(/\s/g, ""))) return;
    const split = splitRow(line, REFERENCE_SHAPE);
    if ("reason" in split) throw new Error(`PLATFORM-REFERENCES.md:${i + 1}: ${split.reason}: ${line}`);
    const [component, treatment, build, ios, android, web] = split.cells;
    rows.push({ key: component.split(" ")[0], component, treatment, build, ios: classifyCell(ios), android: classifyCell(android), web: classifyCell(web), line: i + 1 });
  });
  return rows;
}

/** The catalog key a component slug maps to, or null when the catalog has no row for it. */
export function referenceKeyFor(slug: string, category: Category, keys: Set<string>): string | null {
  const alias = REFERENCE_ROW_ALIASES[slug];
  if (alias) return keys.has(alias) ? alias : null;
  if (keys.has(slug)) return slug;
  return category === "Charts" && keys.has("charts") ? "charts" : null;
}
