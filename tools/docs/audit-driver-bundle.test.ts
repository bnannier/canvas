import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { parse } from "@babel/parser";
import _traverse, { type NodePath } from "@babel/traverse";
import type { Node } from "@babel/types";

// The component audit's in-app driver (docs/src/audit/driver*.tsx) belongs only in the
// native audit build. The docs app reaches it through one door: a require in the root
// layout, inside `if (process.env.EXPO_PUBLIC_CANVAS_AUDIT === "1")`. Expo's Babel preset
// replaces an EXPO_PUBLIC_ variable with its value when it bundles for production
// (babel-preset-expo's inline-env-vars plugin, `undefined` when unset), and Metro's
// constant folding drops the dead branch before it collects dependencies
// (metro-transform-worker runs the constant-folding plugin for every non-dev transform),
// so the driver and everything only it imports never enter an unflagged web export or
// native release bundle. This holds that door's shape and that nothing else opens one:
// a static import, an `import()` or an unguarded require anywhere would put the driver
// in every bundle. The probe context is the one module of the audit that ships
// everywhere, by design: a null-default context the screens register into.

// Bun runs the CommonJS build of @babel/traverse, whose default export lands on `.default`.
const traverse = ((_traverse as unknown as { default?: typeof _traverse }).default ?? _traverse) as typeof _traverse;

const docsSrc = resolve(import.meta.dir, "../../docs/src");
const auditDir = join(docsSrc, "audit");
const LAYOUT = join(docsSrc, "app", "_layout.tsx");
const FLAG = "EXPO_PUBLIC_CANVAS_AUDIT";
/** Modules of the audit every bundle may carry. */
const SHIPPED = new Set([join(auditDir, "probe-context")]);

const sources = readdirSync(docsSrc, { recursive: true })
  .map(String)
  .filter((file) => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(file))
  .map((file) => join(docsSrc, file));

interface Reference {
  /** The resolved module path, extension and platform suffix removed. */
  target: string;
  kind: "import" | "dynamic import" | "require" | "export";
  /** True when the reference sits in the consequent of the exact audit-flag condition. */
  guarded: boolean;
  line: number;
}

function isFlagTest(node: Node | null | undefined): boolean {
  if (!node || node.type !== "BinaryExpression" || node.operator !== "===") return false;
  const sides = [node.left, node.right];
  const flag = sides.find((side) =>
    side.type === "MemberExpression" && !side.computed && side.property.type === "Identifier" && side.property.name === FLAG &&
    side.object.type === "MemberExpression" && !side.object.computed && side.object.object.type === "Identifier" && side.object.object.name === "process" &&
    side.object.property.type === "Identifier" && side.object.property.name === "env");
  const one = sides.find((side) => side.type === "StringLiteral" && side.value === "1");
  return Boolean(flag && one);
}

function guarded(path: NodePath): boolean {
  let child: NodePath = path;
  for (let parent = path.parentPath; parent; child = parent, parent = parent.parentPath) {
    if (parent.isIfStatement() && parent.node.consequent === child.node && isFlagTest(parent.node.test)) return true;
    if (parent.isConditionalExpression() && parent.node.consequent === child.node && isFlagTest(parent.node.test)) return true;
    if (parent.isLogicalExpression({ operator: "&&" }) && parent.node.right === child.node && isFlagTest(parent.node.left)) return true;
  }
  return false;
}

/** Every module reference in `source` (a file at `file`) that resolves into docs/src/audit. */
function auditReferences(source: string, file: string): Reference[] {
  const ast = parse(source, { sourceType: "module", plugins: ["typescript", "jsx"] });
  const found: Reference[] = [];
  const add = (specifier: string, kind: Reference["kind"], path: NodePath, line: number) => {
    if (!specifier.startsWith(".")) return;
    const target = resolve(dirname(file), specifier).replace(/(\.(native|ios|android|web))?\.[jt]sx?$/, "");
    if (target === auditDir || target.startsWith(`${auditDir}/`)) found.push({ target, kind, guarded: guarded(path), line });
  };
  traverse(ast, {
    ImportDeclaration(path) {
      if (path.node.importKind !== "type") add(path.node.source.value, "import", path, path.node.loc?.start.line ?? 0);
    },
    ExportNamedDeclaration(path) {
      if (path.node.source && path.node.exportKind !== "type") add(path.node.source.value, "export", path, path.node.loc?.start.line ?? 0);
    },
    ExportAllDeclaration(path) {
      if (path.node.exportKind !== "type") add(path.node.source.value, "export", path, path.node.loc?.start.line ?? 0);
    },
    CallExpression(path) {
      const { callee, arguments: args } = path.node;
      const first = args[0];
      if (first?.type !== "StringLiteral") return;
      if (callee.type === "Identifier" && callee.name === "require") add(first.value, "require", path, path.node.loc?.start.line ?? 0);
      if (callee.type === "Import") add(first.value, "dynamic import", path, path.node.loc?.start.line ?? 0);
    },
  });
  return found;
}

/** Why each reference into the audit is not allowed, if it is not. */
function violations(file: string, references: Reference[]): string[] {
  const inside = file.startsWith(`${auditDir}/`);
  return references.flatMap((ref) => {
    if (inside) {
      // The audit's own modules import one another freely, except that the module every
      // bundle carries must not pull the driver in behind it.
      const fromShipped = SHIPPED.has(file.replace(/\.[jt]sx?$/, ""));
      return fromShipped && !SHIPPED.has(ref.target) ? [`${relative(docsSrc, file)}:${ref.line} ships everywhere and imports ${relative(docsSrc, ref.target)}`] : [];
    }
    if (SHIPPED.has(ref.target)) return [];
    if (file === LAYOUT && ref.kind === "require" && ref.guarded && ref.target === join(auditDir, "driver")) return [];
    return [`${relative(docsSrc, file)}:${ref.line} ${ref.kind}s ${relative(docsSrc, ref.target)}${ref.guarded ? "" : ` outside \`if (process.env.${FLAG} === "1")\``}`];
  });
}

test("the audit driver is reached only through the root layout's flagged require", () => {
  const offenders = sources.flatMap((file) => violations(file, auditReferences(readFileSync(file, "utf8"), file)));
  expect(offenders).toEqual([]);
});

test("the root layout does require the driver, inside the flag", () => {
  const references = auditReferences(readFileSync(LAYOUT, "utf8"), LAYOUT);
  expect(references.filter((ref) => ref.target === join(auditDir, "driver")).map(({ kind, guarded: inFlag }) => ({ kind, guarded: inFlag }))).toEqual([{ kind: "require", guarded: true }]);
});

test("the guard sees the references it should reject", () => {
  const check = (source: string, file = LAYOUT) => violations(file, auditReferences(source, file));
  const elsewhere = join(docsSrc, "ui", "page.tsx");
  // The accepted shapes.
  expect(check(`if (process.env.${FLAG} === "1") { Driver = require("../audit/driver").AuditDriver; }`)).toEqual([]);
  expect(check(`const Driver = "1" === process.env.${FLAG} ? require("../audit/driver") : null;`)).toEqual([]);
  expect(check(`import { useAuditProbe } from "../audit/probe-context";`, elsewhere)).toEqual([]);
  expect(check(`import type { AuditItem } from "../audit/protocol";`, elsewhere)).toEqual([]);
  // A static import, an unguarded require, a different flag, a dynamic import, or the
  // driver reached from another file all carry the driver into every bundle.
  expect(check(`import { AuditDriver } from "../audit/driver";`)).toHaveLength(1);
  expect(check(`const Driver = require("../audit/driver");`)).toHaveLength(1);
  expect(check(`if (process.env.${FLAG} === "0") require("../audit/driver");`)).toHaveLength(1);
  expect(check(`if (process.env.${FLAG}) require("../audit/driver");`)).toHaveLength(1);
  expect(check(`if (process.env.${FLAG} === "1") {} else { require("../audit/driver"); }`)).toHaveLength(1);
  expect(check(`if (process.env.${FLAG} === "1") void import("../audit/driver");`)).toHaveLength(1);
  expect(check(`if (process.env.${FLAG} === "1") require("../audit/driver");`, elsewhere)).toHaveLength(1);
  expect(check(`export { AuditDriver } from "../audit/driver";`, elsewhere)).toHaveLength(1);
  // The shipped probe context must not import the driver behind it.
  expect(check(`import { AuditDriver } from "./driver";`, join(auditDir, "probe-context.tsx"))).toHaveLength(1);
});
