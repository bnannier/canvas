/**
 * The corners the kit's comments state, so a comment cannot keep a number the code no
 * longer draws.
 *
 * A comment that restates a corner ("the Card's 20px corner", "a card (8 radius", "radius
 * 6", "rounded-14", "a 10pt continuous surface") drifts the moment the skin it describes
 * changes, and nothing reads it again: the Dark Factory migration left dozens stating the
 * corners of the look it replaced. test/design-rules-shape.test.ts holds every corner a
 * source comment states to the corners its component draws (tools/tokens/corner-sites.ts),
 * and every corner a hand-off comment states to the corner tokens it introduces, so a
 * comment names the role ("the card corner") or a number that is true.
 *
 * Source comments are read with the TypeScript scanner, so a URL or a string that looks
 * like a comment is not one. Square and full (0, 999, 9999) are left out: they are shapes,
 * not a component's own corner.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

/** A corner a comment states. */
export interface CornerClaim {
  value: number;
  /** Repo-relative file of the comment. */
  file: string;
  line: number;
  /** The phrase that states it, for a report. */
  text: string;
}

/** A corner a hand-off comment states, with the corner tokens it introduces. */
export interface HandoffClaim extends CornerClaim {
  /** The values of the `--*radius*` custom properties the comment sits over (or beside). */
  tokens: number[];
}

// A number that stands on its own: not the 3 of "M3", nor a digit inside a longer word.
const NUMBER = String.raw`(?<![\w.])(\d+(?:\.\d+)?)`;
const UNIT = String.raw`(?:px|pt|dp)?`;
// Up to two words between the number and the noun ("the 12px field corner", "8px card corner").
const BETWEEN = String.raw`(?:[a-z]+[ -]){0,2}`;

/** The ways a comment states a corner: "8px radius", "a 26pt continuous corner", "radius 6", "corner of 12", "rounded-14", "10pt continuous". */
const CLAIMS = [
  new RegExp(String.raw`${NUMBER}\s?${UNIT}[- ]${BETWEEN}(?:corner|corners|cornered|radius|radii)\b`, "gi"),
  new RegExp(String.raw`\b(?:corner|radius)(?: of| at| is)? ~?${NUMBER}${UNIT}(?![\w.])`, "gi"),
  new RegExp(String.raw`\brounded-${NUMBER}\b`, "gi"),
  // Apple's continuous corner curve, stated with its radius ("a 12pt continuous card").
  new RegExp(String.raw`${NUMBER}\s?${UNIT} continuous\b`, "gi"),
];

const SHAPES = new Set([0, 999, 9999]);

function claimsIn(comment: string, offset: number, text: string, file: string): CornerClaim[] {
  const out: CornerClaim[] = [];
  const seen = new Set<number>();
  for (const pattern of CLAIMS) {
    for (const match of comment.matchAll(pattern)) {
      const value = Number(match[1]);
      const at = offset + match.index!;
      if (SHAPES.has(value) || seen.has(at)) continue;
      seen.add(at);
      out.push({ value, file, line: text.slice(0, at).split("\n").length, text: match[0] });
    }
  }
  return out;
}

/** Every corner the comments of these source files state. */
export function cornerClaims(root: string, relativeFiles: string[]): CornerClaim[] {
  const out: CornerClaim[] = [];
  for (const file of relativeFiles) {
    const text = readFileSync(join(root, file), "utf8");
    const variant = file.endsWith("x") ? ts.LanguageVariant.JSX : ts.LanguageVariant.Standard;
    const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, variant, text);
    for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
      if (token !== ts.SyntaxKind.SingleLineCommentTrivia && token !== ts.SyntaxKind.MultiLineCommentTrivia) continue;
      out.push(...claimsIn(scanner.getTokenText(), scanner.getTokenStart(), text, file));
    }
  }
  return out;
}

const RADIUS_TOKEN = /--[\w-]*radius[\w-]*\s*:\s*(\d+(?:\.\d+)?)px/g;

/**
 * Every corner the comments of these hand-off stylesheets state, each with the corner
 * tokens it introduces: the declarations after it up to the next comment that opens a
 * line, or, for a comment that trails a declaration on its line, that line's.
 */
export function handoffClaims(root: string, relativeFiles: string[]): HandoffClaim[] {
  const out: HandoffClaim[] = [];
  for (const file of relativeFiles) {
    const text = readFileSync(join(root, file), "utf8");
    // A comment trails a declaration when its line holds one before it (`--x:1 /* @kind */`).
    const trailing = (start: number) => /:\s*\S/.test(text.slice(text.lastIndexOf("\n", start - 1) + 1, start));
    const comments = [...text.matchAll(/\/\*[\s\S]*?\*\//g)].map((m) => ({ start: m.index!, text: m[0], trails: trailing(m.index!) }));
    comments.forEach((comment, i) => {
      const end = comment.start + comment.text.length;
      const next = comments.slice(i + 1).find((c) => !c.trails);
      const block = comment.trails
        ? text.slice(text.lastIndexOf("\n", comment.start - 1) + 1, comment.start)
        : text.slice(end, next ? next.start : text.length);
      const tokens = [...block.matchAll(RADIUS_TOKEN)].map((m) => Number(m[1]));
      for (const claim of claimsIn(comment.text, comment.start, text, file)) out.push({ ...claim, tokens });
    });
  }
  return out;
}
