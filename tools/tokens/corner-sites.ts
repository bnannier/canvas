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
 * app's own pick through a public prop, or a bare number; and every place that draws
 * it, with the platform it draws on (`CornerValue.drawn`), so a constant no platform names
 * is judged on every skin that uses it. tools/tokens/corner-rules.ts judges each one per
 * platform and test/design-rules-shape.test.ts holds the kit to it; the same test holds a
 * comment's corner to what the code it sits on draws (`cornersIn`).
 *
 * The tracing is tools/tokens/source-folder.ts; this module names what it traces (the
 * corner properties) and the tables it reads by name: `shape` and the public `radius`
 * ladder (src/style/tokens.ts) and the kit-internal `platformShape`
 * (src/style/platform-shape.ts).
 */

import ts from "typescript";
import { radius, shape, type PlatformKey, type ShapeTokens } from "../../src/style/tokens.ts";
import { platformShape } from "../../src/style/platform-shape.ts";
import { SourceFolder, lineOf, nameOf, namesADeclaration, unwrap, type Origin, type Sink, type Unresolved } from "./source-folder.ts";

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
  /** Where in its file the number is written (an offset), so a comment can be held to the code it sits on. */
  at: number;
  /** Every place the number sets a corner: the property, attribute or assignment. */
  sets: CornerPlace[];
  /**
   * Every place that draws the corner, with the platform it draws it on. A corner set in a
   * skin is drawn by that skin. One set in a style constant or helper no platform names (a
   * `const EDIT = { borderRadius: ... }` spread into a skin's field, a `menuCard()` a skin
   * calls, a number constant a skin reads) is drawn by every place that uses it, followed
   * until a platform's name or shared code: so a native skin cannot draw another platform's
   * row by reading it through a neutral name. A corner set in a shell is drawn where its
   * number is written (the skin field the shell reads); one a shell writes itself is shared
   * code.
   */
  drawn: DrawnPlace[];
}

/** A place in the source: its file, line, offset and the names enclosing it. */
export interface CornerPlace {
  file: string;
  line: number;
  /** The offset of the place in its file. */
  at: number;
  /** The names enclosing the place, outermost first, a corner property left off (`iosSkin.editInput`). */
  path: string;
}

/** A place that draws a corner, and the platform it draws it on. */
export interface DrawnPlace extends CornerPlace {
  /** The platform whose skin draws here (`platformOf`), or null for code every platform shares, which draws the web look. */
  platform: PlatformKey | null;
}

/**
 * The platform a place is written for, or null for code every platform shares: its file
 * (`card.ios.tsx`), else the innermost of the names enclosing it that names a platform
 * (`iosSkin`, `IOS_RADIUS`, `M3_TRACK_R` for Material 3, `androidBase`).
 */
export function platformOf(place: { file: string; path: string }): PlatformKey | null {
  const byFile = place.file.match(/\.(ios|android|web)\.tsx?$/);
  if (byFile) return byFile[1] as PlatformKey;
  const names = place.path.split(".");
  for (let i = names.length - 1; i >= 0; i--) {
    const m = names[i].match(/^(web|ios|android|m3)(?=[A-Z_]|$)/i);
    if (m) return m[1].toLowerCase() === "m3" ? "android" : (m[1].toLowerCase() as PlatformKey);
  }
  return null;
}

/**
 * The style modules: a component's `.styles.ts(x)` and src/style/. A constant or helper
 * written there with no platform in its name is a part some skin or shell uses, so the
 * places that use it say where it is drawn. Anything else without a platform's name (a
 * shell, a component, an entry with no platform suffix) is code every platform runs.
 */
const STYLE_MODULE = /\.styles\.tsx?$|^src\/style\//;

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

/** Whether a module-level declaration is a function: a function declaration, or a const holding an arrow or function expression. */
function isFunction(node: ts.VariableDeclaration | ts.FunctionDeclaration): boolean {
  if (ts.isFunctionDeclaration(node)) return true;
  const init = node.initializer && unwrap(node.initializer);
  return init !== undefined && (ts.isArrowFunction(init) || ts.isFunctionExpression(init));
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
      at: o.node.getStart(o.sf),
      sets: sinks.map((s) => this.place(s.node, s.sf)),
      drawn: this.drawnPlaces(o, sinks),
    };
  }

  private place(node: ts.Node, sf: ts.SourceFile): DrawnPlace {
    // A shorthand use (`{ zoneActive }`) is the key it sets, as `zoneActive: zoneActive` would be.
    const key = ts.isShorthandPropertyAssignment(node.parent) && node.parent.name === node ? `.${node.parent.name.text}` : "";
    const place = { file: sf.fileName, line: lineOf(sf, node), at: node.getStart(sf), path: this.pathOf(node) + key };
    return { ...place, platform: platformOf(place) };
  }

  /** Every place that draws a number set at these sinks (see `CornerValue.drawn`). */
  private drawnPlaces(o: Origin, sinks: Sink[]): DrawnPlace[] {
    const out = new Map<string, DrawnPlace>();
    for (const s of sinks) {
      const set = this.place(s.node, s.sf);
      let places = [set];
      if (!set.platform) {
        // A helper that rounds whatever corner it is handed (`capsule(radius)`) draws it for
        // the caller that hands it, so the number's own place says where; so does a shell.
        const helper = this.topDeclarationOf(s.node, s.sf);
        const written = this.topDeclarationOf(o.node, o.sf);
        const handed = helper !== null && isFunction(helper.node) && written?.node !== helper.node;
        places = !STYLE_MODULE.test(s.sf.fileName) || handed ? this.placesOf(o.node, o.sf, new Set()) : this.placesOf(s.node, s.sf, new Set());
      }
      for (const place of places) out.set(`${place.file}:${place.at}`, place);
    }
    return [...out.values()];
  }

  /**
   * The corners the code in a span of a scanned file draws, from the corners `scan` found:
   * every corner written, set or drawn in the span; or, for code that draws none itself (a
   * platform entry handing its skin to the shell), the corners of the module-level consts
   * it names, followed the same way.
   */
  cornersIn(values: CornerValue[], file: string, start: number, end: number): Set<number> {
    return this.cornersInSpan(values, this.load(file), start, end, new Set());
  }

  private cornersInSpan(values: CornerValue[], sf: ts.SourceFile, start: number, end: number, seen: Set<ts.Node>): Set<number> {
    const within = (place: { file: string; at: number }) => place.file === sf.fileName && place.at >= start && place.at < end;
    const direct = new Set(values.filter((v) => within(v) || v.sets.some(within) || v.drawn.some(within)).map((v) => v.value));
    if (direct.size > 0) return direct;
    const named = new Set<number>();
    const visit = (node: ts.Node) => {
      if (ts.isIdentifier(node) && node.getStart(sf) >= start && namesADeclaration(node)) {
        const decl = this.resolve(node, sf);
        if (decl?.kind === "var" && !seen.has(decl.node) && this.topDeclarationOf(decl.node, decl.sf)?.node === decl.node && !isFunction(decl.node)) {
          seen.add(decl.node);
          for (const value of this.cornersInSpan(values, decl.sf, decl.node.getStart(decl.sf), decl.node.getEnd(), seen)) named.add(value);
        }
      }
      ts.forEachChild(node, (child) => {
        if (child.getEnd() > start && child.getStart(sf) < end) visit(child);
      });
    };
    visit(sf);
    return named;
  }

  /** Where a place in the source draws: its platform's name, shared code, or every place that uses its style constant. */
  private placesOf(node: ts.Node, sf: ts.SourceFile, chain: Set<ts.Node>): DrawnPlace[] {
    const here = this.place(node, sf);
    if (here.platform || !STYLE_MODULE.test(sf.fileName)) return [here];
    const decl = this.topDeclarationOf(node, sf);
    if (!decl) return [here];
    if (chain.has(decl.node)) return [];
    const uses = this.referencesTo(decl);
    if (uses.length === 0) return [here];
    const next = new Set(chain).add(decl.node);
    return uses.flatMap((use) => this.placesOf(use.node, use.sf, next));
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
