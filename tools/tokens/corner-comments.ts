/**
 * The corners the kit's comments state, so a comment cannot keep a number the code no
 * longer draws.
 *
 * A comment that restates a corner ("the Card's 20px corner", "a card (8 radius", "radius
 * 6", "rounded-14", "a 10pt continuous surface") drifts the moment the skin it describes
 * changes, and nothing reads it again: the Dark Factory migration left dozens stating the
 * corners of the look it replaced. test/design-rules-shape.test.ts holds every corner a
 * source comment states to the corners the code it sits on draws (the node it leads, or the
 * one a trailing comment ends; tools/tokens/corner-sites.ts says what that code draws), and
 * every corner a hand-off comment states to the corner tokens it introduces. So a number in
 * a comment sits on the element that draws it: a comment over a menu card states the card's
 * corner, never its rows', and a comment over code that holds several elements with corners
 * of their own (a whole skin) states a number only every one of them draws (`claimHolds`). A
 * module's header comment, which sits on an import or a type, names roles ("the field
 * corner", "a capsule") rather than numbers.
 *
 * Source comments are read from the TypeScript parse tree, so a URL or a string that looks
 * like a comment is not one, and no template literal hides the comments after it. Square
 * and full (0, 999, 9999) are left out: they are shapes, not a component's own corner.
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

/** A corner a source comment states, with the code the comment describes. */
export interface SourceClaim extends CornerClaim {
  /** The node the comment describes, as offsets in its file, and its first line for a report. */
  on: { start: number; end: number; text: string };
}

/** A corner a hand-off comment states, with the corner tokens it introduces. */
export interface HandoffClaim extends CornerClaim {
  /** The values of the `--*radius*` custom properties the comment sits over (or beside). */
  tokens: number[];
}

// A number that stands on its own: not the 3 of "M3" or "Material 3", the 26 of "iOS 26", the
// 12 of "py-12", nor a digit inside a longer word.
const NUMBER = String.raw`(?<![\w.-])(?<!\b(?:Material|iOS|Android|API|level)\s{1,3})(\d+(?:\.\d+)?)`;
const UNIT = String.raw`(?:px|pt|dp)?`;
// Up to two words between the number and the noun ("the 12px field corner", "8px card corner").
const BETWEEN = String.raw`(?:[a-z]+(?:-|\s+)){0,2}`;

/**
 * The ways a comment states a corner: "8px radius", "a 26pt continuous corner", "radius 6",
 * "corner of 12", "rounded 8", "rounded-14", "10pt continuous", and a number in parentheses
 * after the corner word ("the menu corner (12)", "soft-cornered (10px)", "rounded-top
 * (28dp)", "very rounded (~26pt)"). A number before "rounded" is a size ("a 32pt
 * fully-rounded tile"), not a corner. A phrase may run across the comment's lines.
 */
const CLAIMS = [
  new RegExp(String.raw`${NUMBER}\s?${UNIT}(?:-|\s+)${BETWEEN}(?:corner|corners|cornered|radius|radii)\b`, "gi"),
  // Not a border's width ("a rounded 1px border").
  new RegExp(String.raw`\b(?:corners?|radius|rounded)(?:\s+(?:of|at|is|are))?\s+~?${NUMBER}${UNIT}(?![\w.])(?!\s+(?:border|hairline|outline|ring|stroke)\b)`, "gi"),
  new RegExp(String.raw`\brounded-(\d+(?:\.\d+)?)\b`, "gi"),
  // Apple's continuous corner curve, stated with its radius ("a 12pt continuous card").
  new RegExp(String.raw`${NUMBER}\s?${UNIT}\s+continuous\b`, "gi"),
  new RegExp(String.raw`\b(?:corner|corners|cornered|radius|radii|rounded)(?:-[a-z]+)?\s+\(~?${NUMBER}${UNIT}\)`, "gi"),
];

const SHAPES = new Set([0, 999, 9999]);

/**
 * Whether a corner a comment states is the one the code it sits on draws, given the corners
 * that code draws by element (`CornerSites.cornersIn`, or a table's rows). A number sits on
 * the element that draws it, so where the code holds several elements with a corner of their
 * own, the number has to be every one's: a comment over a whole skin whose outline draws 12
 * and whose inline editor draws 8 cannot say which a "12pt corner" is, and states it on the
 * element instead. An element that draws only square or the pill is a shape, not a corner of
 * its own, and leaves the claim alone, as the claims themselves leave those numbers out.
 */
export function claimHolds(value: number, elements: ReadonlyMap<string, ReadonlySet<number>>): boolean {
  const own = [...elements.values()].filter((set) => [...set].some((n) => !SHAPES.has(n)));
  return own.length > 0 && own.every((set) => set.has(value));
}

/**
 * A comment's text with each line break and the comment marker that opens the next line
 * (`//`, a JSDoc `*`) turned into spaces of the same length, so a phrase that runs across
 * lines reads as one and every offset still points into the file.
 */
const asProse = (comment: string): string => comment.replace(/\n[ \t]*(?:\/\/|\*(?!\/))?/g, (gap) => " ".repeat(gap.length));

function claimsIn(comment: string, offset: number, text: string, file: string): CornerClaim[] {
  const out: CornerClaim[] = [];
  const seen = new Set<number>();
  const prose = asProse(comment);
  for (const pattern of CLAIMS) {
    for (const match of prose.matchAll(pattern)) {
      const value = Number(match[1]);
      const at = offset + match.index!;
      if (SHAPES.has(value) || seen.has(at)) continue;
      seen.add(at);
      out.push({ value, file, line: text.slice(0, at).split("\n").length, text: match[0].replace(/\s+/g, " ") });
    }
  }
  return out;
}

/** Every corner the comments of these source files state, each with the code its comment describes. */
export function cornerClaims(root: string, relativeFiles: string[]): SourceClaim[] {
  const out: SourceClaim[] = [];
  for (const file of relativeFiles) {
    const text = readFileSync(join(root, file), "utf8");
    const jsx = file.endsWith("x");
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, jsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    for (const comment of commentBlocks(sf)) {
      const claims = claimsIn(text.slice(comment.pos, comment.end), comment.pos, text, file);
      if (claims.length === 0) continue;
      const node = describedNode(sf, comment.pos, comment.end);
      const on = { start: node.getStart(sf), end: node.getEnd(), text: node.getText(sf).split("\n")[0].trim() };
      for (const claim of claims) out.push({ ...claim, on });
    }
  }
  return out;
}

/**
 * The comments of a parsed file as the prose they hold: a run of `//` lines, each on a line
 * of its own, is one block, so a phrase that wraps from one line to the next is read whole.
 */
export function commentBlocks(sf: ts.SourceFile): { pos: number; end: number }[] {
  const text = sf.text;
  const ownLine = (range: ts.CommentRange) => !/\S/.test(text.slice(text.lastIndexOf("\n", range.pos - 1) + 1, range.pos));
  const blocks: { pos: number; end: number; open: boolean }[] = [];
  for (const range of commentsOf(sf)) {
    const last = blocks[blocks.length - 1];
    const line = range.kind === ts.SyntaxKind.SingleLineCommentTrivia && ownLine(range);
    if (last?.open && line && /^[ \t]*\n[ \t]*$/.test(text.slice(last.end, range.pos))) last.end = range.end;
    else blocks.push({ pos: range.pos, end: range.end, open: line });
  }
  return blocks.map(({ pos, end }) => ({ pos, end }));
}

/**
 * Every comment in a parsed file, in order: the trivia before and after each token of the
 * tree, closing braces and the end of the file included. A raw scan of the text would lose
 * its place after a template literal or a regular expression, which only the parser reads
 * right, and miss every comment after it.
 */
export function commentsOf(sf: ts.SourceFile): ts.CommentRange[] {
  const found = new Map<number, ts.CommentRange>();
  const text = sf.text;
  const visit = (node: ts.Node) => {
    for (const range of [...(ts.getLeadingCommentRanges(text, node.getFullStart()) ?? []), ...(ts.getTrailingCommentRanges(text, node.getEnd()) ?? [])]) {
      found.set(range.pos, range);
    }
    for (const child of node.getChildren(sf)) visit(child);
  };
  visit(sf);
  return [...found.values()].sort((a, b) => a.pos - b.pos);
}

/**
 * The code a comment describes: the node it leads (the outermost statement, property or
 * element that starts at the first token after it), or, for a comment after code on its
 * line, the outermost node that code ends with. A comment with nothing after it in its block
 * describes the block.
 */
export function describedNode(sf: ts.SourceFile, start: number, end: number): ts.Node {
  const text = sf.text;
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const before = text.slice(lineStart, start);
  if (/\S/.test(before)) {
    const codeEnd = lineStart + before.replace(/[\s,;]+$/, "").length;
    const trailed = outermost(sf, codeEnd - 1, (node) => node.getEnd() === codeEnd);
    if (trailed) return trailed;
  } else {
    const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, sf.languageVariant, text);
    scanner.setTextPos(end);
    scanner.scan();
    const next = scanner.getTokenStart();
    const led = outermost(sf, next, (node) => node.getStart(sf) === next);
    if (led) return led;
  }
  return innermost(sf, start) ?? sf;
}

/** The outermost node (below the file) holding a position that passes a test, or null. */
function outermost(sf: ts.SourceFile, at: number, test: (node: ts.Node) => boolean): ts.Node | null {
  let found: ts.Node | null = null;
  const visit = (node: ts.Node) => {
    if (found) return;
    if (node !== sf && node.kind !== ts.SyntaxKind.SyntaxList && test(node)) {
      found = node;
      return;
    }
    ts.forEachChild(node, (child) => {
      if (!found && child.getStart(sf) <= at && at < child.getEnd()) visit(child);
    });
  };
  visit(sf);
  return found;
}

/** The innermost node (below the file) whose code spans a position, or null. */
function innermost(sf: ts.SourceFile, at: number): ts.Node | null {
  let found: ts.Node | null = null;
  const visit = (node: ts.Node) => {
    ts.forEachChild(node, (child) => {
      if (child.getStart(sf) < at && at < child.getEnd()) {
        found = child;
        visit(child);
      }
    });
  };
  visit(sf);
  return found;
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
