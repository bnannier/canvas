import { describe, expect, it } from "bun:test";
import ts from "typescript";
import { Host, StaticReader, UNKNOWN, type EvalHooks } from "./static-eval.ts";

/** A reader over a module, and the expression the module's last statement is. */
function last(source: string, hooks: EvalHooks = {}): { reader: StaticReader; expr: ts.Expression } {
  const sf = ts.createSourceFile("x.ts", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const statement = sf.statements[sf.statements.length - 1];
  if (!ts.isExpressionStatement(statement)) throw new Error("the last statement is not an expression");
  return { reader: new StaticReader(sf, hooks), expr: statement.expression };
}

/** Every string the last expression can be. */
const strings = (source: string, hooks?: EvalHooks) => {
  const { reader, expr } = last(source, hooks);
  return reader.strings(expr).sort();
};

/** The last expression's value, outside any loop. */
const value = (source: string, hooks?: EvalHooks) => {
  const { reader, expr } = last(source, hooks);
  return reader.evaluate(expr);
};

/** The strings an expression inside a loop body can be: the body's last statement. */
function inLoop(source: string, hooks?: EvalHooks): string[] {
  const sf = ts.createSourceFile("x.ts", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const reader = new StaticReader(sf, hooks);
  let target: ts.Expression | undefined;
  const visit = (n: ts.Node): void => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "probe") target = n.arguments[0];
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return reader.strings(target!).sort();
}

describe("the static reader", () => {
  it("reads literals, templates, consts, objects, arrays and the operators a table predicate uses", () => {
    expect(value('const a = "x";\nconst b = { c: [1, a] };\n`${a}-${b.c[0]}`;')).toBe("x-1");
    expect(value('const { a, b: [, second] } = { a: 1, b: [2, 3] };\na + second;')).toBe(4);
    expect(value('const row = { kind: "template" };\nrow.kind === "template" && !row.missing;')).toBe(true);
    expect(value('const row = { label: undefined, name: "A" };\nrow.label ?? row.name;')).toBe("A");
    expect(value('const s = new Set(["a"]);\ns.has("a");')).toBe(true);
    expect(value('Object.keys({ a: 1, b: 2 }).join("|");')).toBe("a|b");
  });

  it("calls local functions with a body of consts and one return, and the array methods over them", () => {
    expect(value('const rows = [{ k: "a", v: 1 }, { k: "b", v: 2 }];\nconst pick = (k: string) => rows.find((r) => r.k === k)!.v;\npick("b");')).toBe(2);
    expect(value('function twice(n: number) {\n  const m = n + n;\n  return m;\n}\ntwice(3);')).toBe(6);
    expect(value('[1, 2, 3].filter((n) => n !== 2).map((n) => `#${n}`).join(",");')).toBe("#1,#3");
    // A body with anything else in it is not followed.
    expect(value("function f() {\n  if (Math.random()) return 1;\n  return 2;\n}\nf();")).toBe(UNKNOWN);
  });

  it("never guesses: a let, a global, an import, a parameter and anything built from them are unknown", () => {
    expect(value('let a = "x";\na;')).toBe(UNKNOWN);
    expect(value("process.env.X;")).toBe(UNKNOWN);
    expect(value('import { a } from "./a";\n`${a}/b`;')).toBe(UNKNOWN);
    expect(inLoop("function open(slug: string) {\n  probe(`/components/${slug}`);\n}")).toEqual([]);
    // A predicate the reader cannot read for one row leaves the whole filter unknown.
    expect(value('import { x } from "./x";\n[1, 2].filter((n) => n === x);')).toBe(UNKNOWN);
  });

  it("enumerates the rows of the loops an expression reads, through consts, one row per combination", () => {
    const source = [
      'const CASES = [{ dir: "atoms/a", file: "a" }, { dir: "molecules/b", file: "b" }];',
      'for (const platform of ["web", "ios"] as const) {',
      "  for (const c of CASES) {",
      '    const suffix = platform === "web" ? "" : `.${platform}`;',
      "    probe(`../src/${c.dir}/${c.file}${suffix}.tsx`);",
      "  }",
      "}",
    ].join("\n");
    expect(inLoop(source)).toEqual(["../src/atoms/a/a.ios.tsx", "../src/atoms/a/a.tsx", "../src/molecules/b/b.ios.tsx", "../src/molecules/b/b.tsx"]);
    // A loop whose rows are unknown leaves its variable unbound, so nothing is built from it.
    expect(inLoop('import { ROWS } from "./rows";\nfor (const r of ROWS) probe(`/components/${r.slug}`);')).toEqual([]);
    // A loop the hooks skip is left unbound the same way.
    const skipAll: EvalHooks = { skipLoop: () => true };
    expect(inLoop('for (const slug of ["dialog"]) probe(`/components/${slug}`);', skipAll)).toEqual([]);
    expect(inLoop('for (const slug of ["dialog", "dropdown"]) probe(`/components/${slug}`);')).toEqual(["/components/dialog", "/components/dropdown"]);
  });

  it("reads what the hooks hand it for an import, and calls a host function only with known arguments", () => {
    const hooks: EvalHooks = {
      importValue: (specifier, imported) => (specifier === "./routes" && imported === "routes" ? new Host(() => [{ path: "/a", kind: "x" }, { path: "/b", kind: "y" }]) : UNKNOWN),
    };
    expect(strings('import { routes } from "./routes";\nroutes().find((r) => r.kind === "y")!.path;', hooks)).toEqual(["/b"]);
    expect(value('import { routes } from "./routes";\nimport { k } from "./k";\nroutes(k);', hooks)).toBe(UNKNOWN);
  });
});
