/**
 * Every text size the kit's source sets, traced back to where the number is written.
 *
 * A font size reaches a Text through a `fontSize` property, through an SVG text's
 * `fontSize` attribute (`<SvgText fontSize={11}>`, `fontSize="11"`), through a style taken
 * whole from the type scale (`...typeScale.caption`, `labelType: typeScale.eyebrowLg`), or
 * through the helpers and tables a skin builds its type from (`glyphType(WEB_GLYPH[size])`,
 * `FS(11.5, 15)`, `const [fontSize] = M3_DIGIT[size]`). The reading floors are a property
 * of the text, so the place that decides a size is where its role is declared, and that
 * is the place this module reports: the literal in the table row, the call that passes it,
 * the type-scale read. test/design-rules-type-floors.test.ts holds each one to its role.
 *
 * The tracing is tools/tokens/source-folder.ts; this module names what it traces (a
 * `fontSize`, a type-scale style taken whole) and the scale it reads (the type scale).
 */

import ts from "typescript";
import { typeScale } from "../../src/style/type-scale.ts";
import { SourceFolder, lineOf, nameOf, unwrap, type Origin, type Unresolved } from "./source-folder.ts";

/** One number that reaches a text's font size, at the place it is written. */
export interface TypeValue {
  value: number;
  /** Repo-relative file of the place the number is written. */
  file: string;
  line: number;
  /** The names enclosing that place, outermost first (`iosSkin.hourLabel`, `LABEL_TYPE.small`). */
  path: string;
  /** How the number is written: a literal, a type-scale style, or a computation over other values. */
  kind: "literal" | "type scale" | "computed";
}

/** A font size the folder could not trace to a number. */
export type UnresolvedSize = Unresolved;

const STYLES = typeScale as Record<string, { fontSize: number }>;

/** `typeScale.<style>` with a style the scale defines, or null. */
function typeScaleStyle(expr: ts.Expression): string | null {
  const node = unwrap(expr);
  if (!ts.isPropertyAccessExpression(node)) return null;
  if (!ts.isIdentifier(node.expression) || node.expression.text !== "typeScale") return null;
  return node.name.text in STYLES ? node.name.text : null;
}

export class TypeSites extends SourceFolder {
  /** Every number that reaches a font size in these files, and every size that could not be traced. */
  scan(relativeFiles: string[]): { values: TypeValue[]; unresolved: UnresolvedSize[] } {
    const { origins, unresolved } = this.trace(relativeFiles);
    const values = origins.map((o) => ({
      value: o.value,
      file: o.sf.fileName,
      line: lineOf(o.sf, o.node),
      path: this.pathOf(o.node),
      kind: o.kind as TypeValue["kind"],
    }));
    return { values, unresolved };
  }

  /**
   * A fluid size clamped up from its minimum (`Math.max(spec.min, <the window's share>)`, the
   * hand-off's `clamp(min, N vw, max)`) is at least that minimum, the number every floor
   * reads: the size the text takes on a phone, on the server and before the window is known.
   */
  protected partialMath(name: string, _node: ts.CallExpression, _sf: ts.SourceFile, args: (Origin[] | null)[]): Origin[] | null {
    if (name !== "max") return null;
    const seen = args.filter((a): a is Origin[] => a !== null);
    if (seen.length !== 1) return null;
    return seen[0];
  }

  protected sinkOf(node: ts.Node, sf: ts.SourceFile): ts.Expression | null {
    // A key written plainly, as a string, or computed from a literal or a const holding one.
    if (ts.isPropertyAssignment(node) && this.propertyKey(node.name, sf) === "fontSize") return node.initializer;
    if (ts.isShorthandPropertyAssignment(node) && node.name.text === "fontSize") return node.name;
    // An SVG text sizes itself through its attribute: `fontSize={11}` or `fontSize="11"`. An
    // empty expression is reported as untraced; a bare `fontSize` is `true`, which no text
    // takes (a type error), so there is no number to trace.
    if (ts.isJsxAttribute(node) && nameOf(node.name) === "fontSize") {
      const init = node.initializer;
      if (!init) return null;
      return ts.isJsxExpression(init) ? (init.expression ?? init) : init;
    }
    // A type-scale style taken whole (spread, assigned, passed on) sets its size; a read of
    // one of its fields (`.fontSize` inside a fontSize property, `.lineHeight`) is not a
    // style of its own. The scale's own definition is the source, not a use.
    if (ts.isPropertyAccessExpression(node) && typeScaleStyle(node) && !ts.isPropertyAccessExpression(node.parent)) {
      return sf.fileName.endsWith("src/style/type-scale.ts") ? null : node;
    }
    return null;
  }

  protected scaleOf(node: ts.Expression, sf: ts.SourceFile): Origin[] | null {
    // These authored Charts-room SVG labels are measured in viewBox units. Keep
    // tracing their named source size while the chart applies its measured meet scale.
    const chartScale = {
      "src/charts/box-plot/box-plot.shared.tsx": "k",
      "src/charts/waterfall-chart/waterfall-chart.shared.tsx": "k",
      "src/charts/radar-chart/radar-chart.shared.tsx": "compactScale",
    }[sf.fileName];
    if (chartScale && ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.AsteriskToken &&
        ts.isIdentifier(node.right) && node.right.text === chartScale &&
        ts.isPropertyAccessExpression(node.left) && node.left.name.text === "authoredAxisSize") {
      return this.values(node.left, sf, new Set());
    }
    const style = typeScaleStyle(node);
    if (style) return [{ value: STYLES[style].fontSize, node, sf, kind: "type scale", read: `typeScale.${style}` }];
    if (ts.isPropertyAccessExpression(node) && node.name.text === "fontSize") {
      const whole = typeScaleStyle(node.expression);
      if (whole) return [{ value: STYLES[whole].fontSize, node, sf, kind: "type scale", read: `typeScale.${whole}` }];
    }
    return null;
  }

  protected isSinkName(name: string): boolean {
    return name === "fontSize";
  }
}
