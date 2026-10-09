/**
 * Every corner radius the kit's source sets, traced back to where the number is written.
 *
 * A corner reaches a view through a `borderRadius` property or one of its per-corner
 * longhands (`borderTopStartRadius`, `borderBottomRightRadius`), through an assignment to
 * one, or through an SVG shape's `rx` / `ry`; and the number reaches that property from a
 * read of the shape table (`shape.ios.card`), a skin field (`skin.cardRadius`), a table
 * row, or a literal. The shape rules are a decision made where the number is written, so
 * that is the place this module reports, with what the number is: a read of one of the
 * corner tables, a container's corner less an inset (or a capsule's corner plus one), the
 * app's own pick through a public prop, or a bare number. tools/tokens/corner-rules.ts
 * judges each one per platform and test/design-rules-shape.test.ts holds the kit to it.
 *
 * The tracing is tools/tokens/source-folder.ts; this module names what it traces (the
 * corner properties) and the tables it reads by name: `shape` and the public `radius`
 * ladder (src/style/tokens.ts) and the kit-internal `platformShape`
 * (src/style/platform-shape.ts).
 */

import { dirname } from "node:path";
import ts from "typescript";
import { radius, shape, type PlatformKey, type ShapeTokens } from "../../src/style/tokens.ts";
import { platformShape } from "../../src/style/platform-shape.ts";
import { SourceFolder, lineOf, nameOf, unwrap, type Origin, type Sink, type Unresolved } from "./source-folder.ts";

/** A corner property: `borderRadius` and its per-corner longhands, physical and logical. */
export const CORNER_PROPERTY = /^border(?:Top|Bottom|Start|End)?(?:Left|Right|Start|End)?Radius$/;

/** The SVG attributes that round a shape's corners. */
const SVG_CORNER = new Set(["rx", "ry"]);

/** A read of one of the corner tables. */
export type CornerRead =
  | { table: "shape"; platform: PlatformKey; key: keyof ShapeTokens }
  | { table: "platformShape"; platform: PlatformKey; key: string }
  /** The public ladder; `key` is null when the read's key is not in the source. */
  | { table: "radius"; key: string | null };

/** One number that reaches a corner radius, at the place it is written. */
export interface CornerValue {
  value: number;
  /** Repo-relative file of the place the number is written. */
  file: string;
  line: number;
  /** The names enclosing that place, outermost first (`iosSkin.box`, `IOS_RADIUS`). */
  path: string;
  /**
   * How the number is written: a literal, a computation over other values, a read of a
   * corner table, or the app's own pick (a public prop that names a step of the `radius`
   * ladder, as Image's and Video's `radius` do), which is the call site's corner, not the
   * kit's.
   */
  kind: "literal" | "computed" | "read" | "consumer";
  /** For a read (or the app's pick), the table and the row it reads. */
  read?: CornerRead;
  /**
   * A corner written as concentric with another: a table corner less an inset
   * (`skin.radius - CARD_BORDER`, a card's media inside its border), or a capsule's
   * half-height plus an inset (a wrapped track around its pills). Says which, for a report.
   * The form alone proves no container: the rules take it only where
   * tools/tokens/shape-roles.ts declares the construction (CONCENTRIC_CORNERS) and the
   * shape test computes the corner from the container's own skin.
   */
  concentric: string | null;
  /** The source text of the place, for a report. */
  text: string;
  /**
   * The directories of the components this number rounds: where it is written and every
   * place it sets a corner (a Card corner a Radio card reads rounds the Radio too).
   */
  rounds: string[];
}

const PLATFORMS = new Set<string>(Object.keys(shape));
const RADIUS = radius as Record<string, number>;
const PLATFORM_SHAPE = platformShape as Record<PlatformKey, Record<string, number>>;

/** Whether a name is imported from another module under `exported` (directly or as an alias). */
function importsAs(id: ts.Identifier, sf: ts.SourceFile, exported: string): boolean {
  for (const statement of sf.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const element of bindings.elements) {
      if (element.name.text === id.text && (element.propertyName ?? element.name).text === exported) return true;
    }
  }
  return false;
}

/** `<table>.<platform>.<key>` on an imported platform-keyed table, or null. */
function platformRead(expr: ts.Expression, sf: ts.SourceFile, table: "shape" | "platformShape"): { platform: PlatformKey; key: string } | null {
  const node = unwrap(expr);
  if (!ts.isPropertyAccessExpression(node)) return null;
  const row = unwrap(node.expression);
  if (!ts.isPropertyAccessExpression(row) || !ts.isIdentifier(row.expression) || !importsAs(row.expression, sf, table)) return null;
  const platform = row.name.text;
  if (!PLATFORMS.has(platform)) return null;
  const rows = table === "shape" ? (shape as unknown as Record<PlatformKey, Record<string, number>>) : PLATFORM_SHAPE;
  if (!(node.name.text in rows[platform as PlatformKey])) return null;
  return { platform: platform as PlatformKey, key: node.name.text };
}

/** A computation that halves a named value: `height / 2` or `size * 0.5`, never a halved bare number. */
function isHalf(node: ts.Node): boolean {
  if (!ts.isBinaryExpression(node)) return false;
  const right = unwrap(node.right);
  if (!ts.isNumericLiteral(right)) return false;
  const halves =
    (node.operatorToken.kind === ts.SyntaxKind.SlashToken && Number(right.text) === 2) ||
    (node.operatorToken.kind === ts.SyntaxKind.AsteriskToken && Number(right.text) === 0.5);
  return halves && namesSomething(node.left);
}

function namesSomething(node: ts.Node): boolean {
  if (ts.isIdentifier(node)) return true;
  return ts.forEachChild(node, (child) => (namesSomething(child) ? true : undefined)) ?? false;
}

/** `Math.<name>(...)`, or null. */
function mathCall(node: ts.Node): string | null {
  if (!ts.isCallExpression(node)) return null;
  const callee = node.expression;
  return ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression) && callee.expression.text === "Math" ? callee.name.text : null;
}

/**
 * A concentric corner, or null: a table corner less a non-negative inset (through a
 * `Math.max(0, ...)` floor), or a capsule's half-height plus a non-negative inset.
 */
function concentricOf(o: Origin): string | null {
  const node = o.node;
  if (!o.operands || o.operands.length !== 2) return null;
  const [a, b] = o.operands;
  if (mathCall(node) === "max") {
    const rest = a.value === 0 && a.kind === "literal" ? b : b.value === 0 && b.kind === "literal" ? a : null;
    return rest ? concentricOf(rest) : null;
  }
  if (!ts.isBinaryExpression(node)) return null;
  const op = node.operatorToken.kind;
  if (op === ts.SyntaxKind.MinusToken && (a.kind === "shape" || a.kind === "platformShape") && a.read && b.value >= 0) {
    return `inside ${a.read} by ${b.value}`;
  }
  if (op === ts.SyntaxKind.PlusToken && a.kind === "computed" && isHalf(a.node) && b.value >= 0) return `around a capsule by ${b.value}`;
  return null;
}

export class CornerSites extends SourceFolder {
  /** Every number that reaches a corner radius in these files, and every corner that could not be traced. */
  scan(relativeFiles: string[]): { values: CornerValue[]; unresolved: Unresolved[] } {
    const { origins, sinks, unresolved } = this.trace(relativeFiles);
    const values = origins.map((o) => this.corner(o, sinks.get(o) ?? []));
    return { values, unresolved };
  }

  private corner(o: Origin, sinks: Sink[]): CornerValue {
    const isRead = o.kind === "shape" || o.kind === "platformShape" || o.kind === "radius" || o.kind === "consumer";
    return {
      value: o.value,
      file: o.sf.fileName,
      line: lineOf(o.sf, o.node),
      path: this.pathOf(o.node),
      kind: o.kind === "consumer" ? "consumer" : isRead ? "read" : o.kind === "computed" ? "computed" : "literal",
      ...(isRead ? { read: readOf(o) } : {}),
      concentric: o.kind === "computed" ? concentricOf(o) : null,
      text: o.node.getText(o.sf),
      rounds: [...new Set([dirname(o.sf.fileName), ...sinks.map((s) => dirname(s.sf.fileName))])],
    };
  }

  protected sinkOf(node: ts.Node): ts.Expression | null {
    let sink: ts.Expression | null = null;
    if (ts.isPropertyAssignment(node) && CORNER_PROPERTY.test(nameOf(node.name) ?? "")) sink = node.initializer;
    else if (ts.isShorthandPropertyAssignment(node) && CORNER_PROPERTY.test(node.name.text)) sink = node.name;
    // `style.borderRadius = ...` on a style object built up in a shell.
    else if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isPropertyAccessExpression(node.left) &&
      CORNER_PROPERTY.test(node.left.name.text)
    ) {
      sink = node.right;
    } else if (ts.isJsxAttribute(node) && ts.isIdentifier(node.name) && SVG_CORNER.has(node.name.text)) {
      const init = node.initializer;
      if (init && ts.isJsxExpression(init) && init.expression) sink = init.expression;
    }
    // A corner copied off another style (`borderRadius: flat.borderRadius`, a pane taking its
    // surface's corners) is not a corner of its own: the one it copies is traced where it is set.
    if (sink) {
      const read = unwrap(sink);
      if (ts.isPropertyAccessExpression(read) && CORNER_PROPERTY.test(read.name.text)) return null;
    }
    return sink;
  }

  /**
   * A corner clamped to its mark's measured size (`Math.min(skin.barRadius, boxW / 4)`) is the
   * number it is clamped from: the clamp only rounds a mark too small for that corner less,
   * as a renderer bounds 9999 by the element's own size.
   */
  protected partialMath(name: string, _node: ts.CallExpression, _sf: ts.SourceFile, args: (Origin[] | null)[]): Origin[] | null {
    if (name !== "min") return null;
    const seen = args.filter((a): a is Origin[] => a !== null);
    if (seen.length !== 1) return null;
    return seen[0].map((o) => ({ ...o, bound: true as const }));
  }

  protected scaleOf(node: ts.Expression, sf: ts.SourceFile): Origin[] | null {
    for (const table of ["shape", "platformShape"] as const) {
      const read = platformRead(node, sf, table);
      if (!read) continue;
      const rows = table === "shape" ? (shape as unknown as Record<PlatformKey, Record<string, number>>) : PLATFORM_SHAPE;
      return [{ value: rows[read.platform][read.key], node, sf, kind: table, read: `${table}.${read.platform}.${read.key}` }];
    }
    // The public `radius` ladder, read by a key in the source or by a key a prop supplies.
    if ((ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) && ts.isIdentifier(node.expression) && importsAs(node.expression, sf, "radius")) {
      let key: ts.Expression | null = null;
      if (ts.isPropertyAccessExpression(node)) return node.name.text in RADIUS ? [{ value: RADIUS[node.name.text], node, sf, kind: "radius", read: `radius.${node.name.text}` }] : null;
      key = unwrap(node.argumentExpression);
      if (ts.isStringLiteral(key) || ts.isNoSubstitutionTemplateLiteral(key)) {
        return key.text in RADIUS ? [{ value: RADIUS[key.text], node, sf, kind: "radius", read: `radius.${key.text}` }] : null;
      }
      const kind = this.isPropRead(key, sf) ? "consumer" : "radius";
      return Object.keys(RADIUS).map((k) => ({ value: RADIUS[k], node, sf, kind, read: "radius.*" }));
    }
    return null;
  }

  /**
   * Whether an expression reads one of a component's own props: `props.radius`, or a name
   * destructured from the props object (`const { radius } = props`, or the parameter
   * `{ radius }` itself). Such a key is the app's pick at its call site.
   */
  private isPropRead(expr: ts.Expression, sf: ts.SourceFile): boolean {
    const isProps = (id: ts.Expression): boolean => {
      if (!ts.isIdentifier(id)) return false;
      const decl = this.resolve(id, sf);
      return decl?.kind === "param" && decl.node.parent.parameters.indexOf(decl.node) === 0;
    };
    if (ts.isPropertyAccessExpression(expr)) return isProps(unwrap(expr.expression));
    if (!ts.isIdentifier(expr)) return false;
    const decl = this.resolve(expr, sf);
    if (decl?.kind !== "binding") return false;
    const holder = decl.node.parent.parent;
    if (ts.isParameter(holder)) return holder.parent.parameters.indexOf(holder) === 0;
    return ts.isVariableDeclaration(holder) && holder.initializer !== undefined && isProps(unwrap(holder.initializer));
  }

  protected isSinkName(name: string): boolean {
    return CORNER_PROPERTY.test(name) || SVG_CORNER.has(name);
  }
}

function readOf(o: Origin): CornerRead {
  const [table, a, b] = (o.read ?? "").split(".");
  if (table === "radius") return { table: "radius", key: a === "*" ? null : a };
  if (table === "shape") return { table: "shape", platform: a as PlatformKey, key: b as keyof ShapeTokens };
  return { table: "platformShape", platform: a as PlatformKey, key: b };
}
