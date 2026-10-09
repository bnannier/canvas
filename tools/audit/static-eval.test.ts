import { describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ts from "typescript";
import { ROOT } from "../../e2e/support/routes.ts";
import { ModuleGraph } from "./hosts.ts";
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

/** The argument of the module's `probe(...)` call, and its reader. */
function probe(source: string, hooks?: EvalHooks): { reader: StaticReader; target: ts.Expression } {
  const sf = ts.createSourceFile("x.ts", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const reader = new StaticReader(sf, hooks);
  let target: ts.Expression | undefined;
  const visit = (n: ts.Node): void => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "probe") target = n.arguments[0];
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return { reader, target: target! };
}

/** The strings the `probe(...)` argument can be, in the ways it is reached that no doubt filters. */
const inLoop = (source: string, hooks?: EvalHooks): string[] => {
  const { reader, target } = probe(source, hooks);
  return reader.strings(target).sort();
};

/** Each way the `probe(...)` argument is reached: its value, and the reader's doubt. */
const reached = (source: string) => {
  const { reader, target } = probe(source);
  return reader.values(target).reached.map((r) => ({ value: r.value, doubt: r.doubt, notes: r.notes }));
};

describe("the static reader", () => {
  it("reads literals, templates, consts, objects, arrays and the operators a table predicate uses", () => {
    expect(value('const a = "x";\nconst b = { c: [1, a] };\n`${a}-${b.c[0]}`;')).toBe("x-1");
    expect(value('const { a, b: [, second] } = { a: 1, b: [2, 3] };\na + second;')).toBe(4);
    expect(value('const row = { kind: "template" };\nrow.kind === "template" && !row.missing;')).toBe(true);
    expect(value('const row = { label: undefined, name: "A" };\nrow.label ?? row.name;')).toBe("A");
    expect(value('const s = new Set(["a"]);\ns.has("a");')).toBe(true);
    expect(value('Object.keys({ a: 1, b: 2 }).join("|");')).toBe("a|b");
    // Regular expressions and the string methods a path or a filter uses.
    expect(value('/minTarget/.test("const minTarget = 44;");')).toBe(true);
    expect(value('"src/atoms/chip".replace(/^src\\//, "");')).toBe("atoms/chip");
    expect(value('"a.ios.tsx".endsWith(".ios.tsx") ? "native" : "web";')).toBe("native");
    expect(value('[3, 1, 2].sort().slice(0, 2).concat([9]).join("");')).toBe("129");
  });

  it("runs a local function's body: consts, lets, if, for...of, continue, and the mutators of a value it made", () => {
    expect(value('const rows = [{ k: "a", v: 1 }, { k: "b", v: 2 }];\nconst pick = (k: string) => rows.find((r) => r.k === k)!.v;\npick("b");')).toBe(2);
    expect(value("function twice(n: number) {\n  const m = n + n;\n  return m;\n}\ntwice(3);")).toBe(6);
    expect(value('[1, 2, 3].filter((n) => n !== 2).map((n) => `#${n}`).join(",");')).toBe("#1,#3");
    // test/touch-target-coverage.test.ts's shape: an accumulator, a guard, a sorted spread.
    const accumulate = [
      "function dirs(): string[] {",
      "  const out = new Set<string>();",
      '  for (const rel of ["src/b/x.tsx", "src/a/y.ios.tsx", "src/a/y.tsx", "src/b/z.tsx"]) {',
      '    if (rel.endsWith(".ios.tsx")) continue;',
      '    out.add(rel.split("/")[1]);',
      "  }",
      "  return [...out].sort();",
      "}",
      "dirs();",
    ].join("\n");
    expect(value(accumulate)).toEqual(["a", "b"]);
    expect(value("function count() {\n  let n = 0;\n  for (let i = 0; i < 4; i++) n += i;\n  return n;\n}\ncount();")).toBe(6);
    // A body the reader cannot run leaves the result unknown, never a guess.
    expect(value("function f() {\n  while (Math.random()) return 1;\n  return 2;\n}\nf();")).toBe(UNKNOWN);
    expect(value("function f() {\n  if (Math.random()) return 1;\n  return 2;\n}\nf();")).toBe(UNKNOWN);
    // A value it did not make (a module const) is never changed in place.
    expect(value("const SHARED = [1];\nfunction grow() {\n  const list = SHARED;\n  list.push(2);\n  return list;\n}\ngrow();")).toBe(UNKNOWN);
  });

  it("never guesses: a let, a global, an import, an uncalled parameter and anything built from them are unknown", () => {
    expect(value('let a = "x";\na;')).toBe(UNKNOWN);
    expect(value("process.env.X;")).toBe(UNKNOWN);
    expect(value('import { a } from "./a";\n`${a}/b`;')).toBe(UNKNOWN);
    expect(inLoop("function open(slug: string) {\n  probe(`/components/${slug}`);\n}")).toEqual([]);
    // A predicate the reader cannot read for one row leaves the whole filter unknown.
    expect(value('import { x } from "./x";\n[1, 2].filter((n) => n === x);')).toBe(UNKNOWN);
  });

  it("never reads a const the module changes as its literal, and says where it changes (item g)", () => {
    for (const change of ["TABLE.push(\"c\");", "TABLE.splice(0, 1);", "TABLE.length = 0;", 'TABLE[0] = "z";', "TABLE.sort();", "for (const row of TABLE) row.x = 1;"]) {
      expect(value(`const TABLE = ["a", "b"];\n${change}\nTABLE;`)).toBe(UNKNOWN);
    }
    const [one] = reached('const TABLE = ["a"];\nTABLE.push("b");\nfor (const t of TABLE) probe(t);');
    expect(one.doubt?.why).toBe("line 3: the loop's rows cannot be read (TABLE (line 1) is changed at line 2, so it is not read as its literal)");
    // A copy is not the table: sorting a spread changes nothing.
    expect(value('const TABLE = ["b", "a"];\nconst sorted = [...TABLE].sort();\nTABLE;')).toEqual(["b", "a"]);
  });

  it("enumerates the rows of the loops around a node, through consts, one row per combination", () => {
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
    // A for...in over an object's keys, and the indexed loop over an array's length.
    expect(inLoop('const ROUTES = { a: "/x", b: "/y" };\nfor (const key in ROUTES) probe(ROUTES[key]);')).toEqual(["/x", "/y"]);
    expect(inLoop('const ROUTES = ["/x", "/y"];\nfor (let i = 0; i < ROUTES.length; i++) probe(ROUTES[i]);')).toEqual(["/x", "/y"]);
    // A loop whose rows are unknown leaves its variable unbound, so nothing is built from it.
    expect(inLoop('import { ROWS } from "./rows";\nfor (const r of ROWS) probe(`/components/${r.slug}`);')).toEqual([]);
    // A loop the hooks skip is left unbound the same way.
    const skipAll: EvalHooks = { skipLoop: () => true };
    expect(inLoop('for (const slug of ["dialog"]) probe(`/components/${slug}`);', skipAll)).toEqual([]);
    expect(inLoop('for (const slug of ["dialog", "dropdown"]) probe(`/components/${slug}`);')).toEqual(["/components/dialog", "/components/dropdown"]);
  });

  it("binds a function's parameters at every call site in the module, through the loops around each call (HIGH 1, HIGH 2)", () => {
    const helper = [
      "async function entry(page: unknown, recipe: { slug: string }, width: number) {",
      "  probe(`/components/${recipe.slug}?w=${width}`);",
      "}",
      'const fields = [{ slug: "textarea" }, { slug: "input-otp" }];',
      'for (const recipe of fields) for (const width of [1280, 390]) test(recipe.slug, async ({ page }) => entry(page, recipe, width));',
      'test("solid", async ({ page }) => entry(page, { slug: "phone-input" }, 390));',
    ].join("\n");
    expect(inLoop(helper)).toEqual([
      "/components/input-otp?w=1280",
      "/components/input-otp?w=390",
      "/components/phone-input?w=390",
      "/components/textarea?w=1280",
      "/components/textarea?w=390",
    ]);
    // A const-bound arrow, called from a table's rows; and a callback per element of an array.
    expect(inLoop('const load = (path: string) => probe(path);\nconst CASES = [load("a"), load("b")];')).toEqual(["a", "b"]);
    expect(inLoop('["x", "y"].forEach((slug) => test(slug, () => probe(`/c/${slug}`)));')).toEqual(["/c/x", "/c/y"]);
    // A table handed to `each`, one call per row.
    expect(inLoop('describe.each([["a", 1], ["b", 2]])("%s", (name, n) => probe(`${name}${n}`));')).toEqual(["a1", "b2"]);
  });

  it("drops the rows a guard skips, and says why where it cannot tell (item b)", () => {
    const guard = (cond: string) => `for (const slug of ["a", "b", "c"]) {\n  if (${cond}) continue;\n  test(slug, () => probe(slug));\n}`;
    expect(inLoop(guard('slug === "b"'))).toEqual(["a", "c"]);
    // A return in a callback skips that row; a break ends the rows.
    expect(inLoop('["a", "b"].forEach((slug) => {\n  if (slug === "a") return;\n  probe(slug);\n});')).toEqual(["b"]);
    expect(inLoop('for (const slug of ["a", "b", "c"]) {\n  if (slug === "b") break;\n  probe(slug);\n}')).toEqual(["a"]);
    // A branch keeps only the rows its condition holds for.
    expect(inLoop('for (const slug of ["a", "b"]) if (slug !== "a") probe(slug);')).toEqual(["b"]);
    // A guard over a row the reader cannot read filters the rows: those values are in doubt.
    const [first] = reached(guard("process.env[slug]"));
    expect(first.doubt).toEqual({ why: "line 2: a guard the reader cannot read", filters: true });
    expect(inLoop(guard("process.env[slug]"))).toEqual([]);
    // A helper the module exports may run or not, but its values are what they are.
    const [exported] = reached('export function open() {\n  probe("/components/dialog");\n}');
    expect(exported).toMatchObject({ value: "/components/dialog", doubt: { filters: false } });
  });

  it("reads what the hooks hand it for an import, and calls a host function only with known arguments", () => {
    const hooks: EvalHooks = {
      importValue: (specifier, imported) => (specifier === "./routes" && imported === "routes" ? new Host(() => [{ path: "/a", kind: "x" }, { path: "/b", kind: "y" }]) : UNKNOWN),
    };
    expect(strings('import { routes } from "./routes";\nroutes().find((r) => r.kind === "y")!.path;', hooks)).toEqual(["/b"]);
    expect(value('import { routes } from "./routes";\nimport { k } from "./k";\nroutes(k);', hooks)).toBe(UNKNOWN);
  });
});

describe("the checkout as the reader sees it (tools/audit/hosts.ts)", () => {
  /** A throwaway checkout with these files. */
  function checkout(files: Record<string, string>): string {
    const root = mkdtempSync(join(tmpdir(), "canvas-hosts-"));
    for (const [path, source] of Object.entries(files)) {
      mkdirSync(join(root, path, ".."), { recursive: true });
      writeFileSync(join(root, path), source);
    }
    return root;
  }

  it("reads node:path, import.meta, the checkout's files and globs, and another module's exports", () => {
    const root = checkout({
      "src/atoms/a/a.styles.ts": "export const webSkin = { pressedOpacity: 0.8 };",
      "src/atoms/b/b.styles.ts": "export const webSkin = {};",
      "tools/families.ts": 'export const FAMILIES = [{ module: "atoms/a/a" }];\nexport { FAMILIES as ALIAS };',
      "test/x.test.ts": [
        'import { readFileSync } from "node:fs";',
        'import * as path from "node:path";',
        'import { Glob } from "bun";',
        'import { ALIAS } from "../tools/families.ts";',
        'const ROOT = path.join(import.meta.dir, "..");',
        'const skins = [...new Glob("src/*/*/*.styles.ts").scanSync(ROOT)].sort();',
        "for (const rel of skins) {",
        '  if (!/pressedOpacity/.test(readFileSync(path.join(ROOT, rel), "utf8"))) continue;',
        "  probe(path.join(ROOT, rel));",
        "}",
        'for (const family of ALIAS) probe(`${family.module}.styles.js`);',
      ].join("\n"),
    });
    try {
      const reader = new ModuleGraph(root).reader("test/x.test.ts");
      const probes: ts.Expression[] = [];
      const visit = (n: ts.Node): void => {
        if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "probe") probes.push(n.arguments[0]);
        ts.forEachChild(n, visit);
      };
      visit(reader.sf);
      expect(reader.strings(probes[0])).toEqual([join(root, "src/atoms/a/a.styles.ts")]);
      expect(reader.strings(probes[1])).toEqual(["atoms/a/a.styles.js"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("refuses what depends on where it runs: a path outside the checkout, a working-directory path, the environment", () => {
    const reader = new ModuleGraph(ROOT).reader(
      "test/y.test.ts",
      'import { readFileSync } from "node:fs";\nimport { resolve } from "node:path";\nprobe(readFileSync("/etc/hosts", "utf8"));\nprobe(resolve("src"));\nprobe(process.env.HOME);',
    );
    const values: unknown[] = [];
    const visit = (n: ts.Node): void => {
      if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "probe") values.push(reader.evaluate(n.arguments[0]));
      ts.forEachChild(n, visit);
    };
    visit(reader.sf);
    expect(values).toEqual([UNKNOWN, UNKNOWN, UNKNOWN]);
  });
});
