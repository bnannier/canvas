/**
 * Every text size the kit's source sets, traced back to where the number is written.
 *
 * A font size reaches a Text through a `fontSize` property, through a style taken whole
 * from the type scale (`...typeScale.caption`, `labelType: typeScale.eyebrowLg`), or
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

  protected sinkOf(node: ts.Node, sf: ts.SourceFile): ts.Expression | null {
    if (ts.isPropertyAssignment(node) && nameOf(node.name) === "fontSize") return node.initializer;
    if (ts.isShorthandPropertyAssignment(node) && node.name.text === "fontSize") return node.name;
    // A type-scale style taken whole (spread, assigned, passed on) sets its size; a read of
    // one of its fields (`.fontSize` inside a fontSize property, `.lineHeight`) is not a
    // style of its own. The scale's own definition is the source, not a use.
    if (ts.isPropertyAccessExpression(node) && typeScaleStyle(node) && !ts.isPropertyAccessExpression(node.parent)) {
      return sf.fileName.endsWith("src/style/type-scale.ts") ? null : node;
    }
    return null;
  }

  protected scaleOf(node: ts.Expression, sf: ts.SourceFile): Origin[] | null {
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
